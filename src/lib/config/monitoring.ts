/**
 * Monitoring Configuration
 *
 * Environment-specific configuration for monitoring and alerting
 */

import type { ProductionMonitoringConfig } from '@/lib/api/standardization/production-monitoring';

/**
 * Get monitoring configuration based on environment
 */
export function getMonitoringConfig(): Partial<ProductionMonitoringConfig> {
  const environment = process.env.NODE_ENV || 'development';

  const baseConfig = {
    serviceName: process.env.SERVICE_NAME || 'complaint-system',
    version: process.env.SERVICE_VERSION || '1.0.0',
    environment: environment as 'production' | 'staging' | 'development',
  };

  switch (environment as any) {
    case 'production':
      return {
        ...baseConfig,
        dashboardRefreshInterval: 30000, // 30 seconds
        metricsRetentionDays: 90,
        errorRateThreshold: 0.02, // 2% error rate
        responseTimeThreshold: 1500, // 1.5 seconds
        throughputThreshold: 200, // requests per minute
        alertWebhookUrl: process.env.PROD_ALERT_WEBHOOK_URL,
        emailNotifications: process.env.PROD_ALERT_EMAILS?.split(','),
        slackWebhookUrl: process.env.PROD_SLACK_WEBHOOK_URL,
      };

    case 'staging':
      return {
        ...baseConfig,
        dashboardRefreshInterval: 60000, // 1 minute
        metricsRetentionDays: 30,
        errorRateThreshold: 0.05, // 5% error rate
        responseTimeThreshold: 3000, // 3 seconds
        throughputThreshold: 50, // requests per minute
        alertWebhookUrl: process.env.STAGING_ALERT_WEBHOOK_URL,
        emailNotifications: process.env.STAGING_ALERT_EMAILS?.split(','),
        slackWebhookUrl: process.env.STAGING_SLACK_WEBHOOK_URL,
      };

    case 'development':
    default:
      return {
        ...baseConfig,
        dashboardRefreshInterval: 120000, // 2 minutes
        metricsRetentionDays: 7,
        errorRateThreshold: 0.1, // 10% error rate
        responseTimeThreshold: 5000, // 5 seconds
        throughputThreshold: 10, // requests per minute
        // No alerts in development
      };
  }
}

/**
 * Monitoring feature flags
 */
export const MONITORING_FEATURES = {
  // Enable/disable monitoring based on environment
  ENABLED: process.env.MONITORING_ENABLED !== 'false',

  // Dashboard features
  DASHBOARD_ENABLED: process.env.DASHBOARD_ENABLED !== 'false',
  REAL_TIME_UPDATES: process.env.REAL_TIME_DASHBOARD !== 'false',

  // Alerting features
  ALERTS_ENABLED: process.env.ALERTS_ENABLED !== 'false',
  EMAIL_ALERTS: process.env.EMAIL_ALERTS_ENABLED === 'true',
  SLACK_ALERTS: process.env.SLACK_ALERTS_ENABLED === 'true',
  WEBHOOK_ALERTS: process.env.WEBHOOK_ALERTS_ENABLED === 'true',

  // Performance monitoring
  PERFORMANCE_MONITORING: process.env.PERFORMANCE_MONITORING !== 'false',
  ERROR_TRACKING: process.env.ERROR_TRACKING !== 'false',
  CACHE_MONITORING: process.env.CACHE_MONITORING !== 'false',

  // Advanced features
  DISTRIBUTED_TRACING: process.env.DISTRIBUTED_TRACING === 'true',
  CUSTOM_METRICS: process.env.CUSTOM_METRICS_ENABLED === 'true',
  LOG_AGGREGATION: process.env.LOG_AGGREGATION_ENABLED === 'true',
};

/**
 * Alert notification templates
 */
export const ALERT_TEMPLATES = {
  HIGH_ERROR_RATE: {
    title: '🚨 High Error Rate Alert',
    message:
      'API error rate has exceeded the threshold of {{threshold}}%. Current rate: {{current}}%',
    severity: 'critical' as const,
    actions: [
      'Check recent deployments',
      'Review error logs',
      'Verify database connectivity',
      'Check external service dependencies',
    ],
  },

  HIGH_RESPONSE_TIME: {
    title: '⚠️ High Response Time Alert',
    message: 'API response time has exceeded {{threshold}}ms. Current P95: {{current}}ms',
    severity: 'warning' as const,
    actions: [
      'Check database query performance',
      'Review cache hit rates',
      'Monitor server resources',
      'Analyze slow endpoints',
    ],
  },

  LOW_THROUGHPUT: {
    title: '📉 Low Throughput Alert',
    message: 'API throughput has dropped below {{threshold}} RPM. Current: {{current}} RPM',
    severity: 'warning' as const,
    actions: [
      'Check for service outages',
      'Verify load balancer configuration',
      'Monitor user activity patterns',
      'Review rate limiting settings',
    ],
  },

  DATABASE_ISSUES: {
    title: '🗄️ Database Connection Alert',
    message: 'Database connection pool usage is at {{current}}% (threshold: {{threshold}}%)',
    severity: 'critical' as const,
    actions: [
      'Check database server status',
      'Review connection pool configuration',
      'Monitor long-running queries',
      'Verify database resource usage',
    ],
  },

  REALTIME_ISSUES: {
    title: '🔄 Real-time Connection Alert',
    message: 'Real-time connections have dropped by {{percentage}}%',
    severity: 'warning' as const,
    actions: [
      'Check WebSocket server status',
      'Review real-time service logs',
      'Monitor network connectivity',
      'Verify authentication issues',
    ],
  },
};

/**
 * Dashboard configuration presets
 */
export const DASHBOARD_PRESETS = {
  OVERVIEW: {
    title: 'System Overview',
    layout: 'grid',
    panels: [
      { type: 'metric', title: 'Request Rate', size: 'small' },
      { type: 'metric', title: 'Error Rate', size: 'small' },
      { type: 'metric', title: 'Response Time', size: 'small' },
      { type: 'metric', title: 'Active Users', size: 'small' },
      { type: 'chart', title: 'Traffic Trends', size: 'large' },
      { type: 'chart', title: 'Error Trends', size: 'medium' },
      { type: 'table', title: 'Top Endpoints', size: 'medium' },
    ],
  },

  PERFORMANCE: {
    title: 'Performance Monitoring',
    layout: 'rows',
    panels: [
      { type: 'chart', title: 'Response Time Percentiles', size: 'large' },
      { type: 'chart', title: 'Throughput', size: 'large' },
      { type: 'heatmap', title: 'Response Time Distribution', size: 'large' },
      { type: 'table', title: 'Slowest Endpoints', size: 'medium' },
    ],
  },

  ERRORS: {
    title: 'Error Analysis',
    layout: 'mixed',
    panels: [
      { type: 'metric', title: 'Total Errors', size: 'small' },
      { type: 'metric', title: 'Error Rate', size: 'small' },
      { type: 'pie', title: 'Error Types', size: 'medium' },
      { type: 'chart', title: 'Error Trends', size: 'large' },
      { type: 'table', title: 'Recent Errors', size: 'large' },
    ],
  },

  REALTIME: {
    title: 'Real-time Monitoring',
    layout: 'grid',
    panels: [
      { type: 'metric', title: 'Active Connections', size: 'small' },
      { type: 'metric', title: 'Messages/sec', size: 'small' },
      { type: 'chart', title: 'Connection Trends', size: 'large' },
      { type: 'chart', title: 'Message Volume', size: 'large' },
      { type: 'table', title: 'Connection Status', size: 'medium' },
    ],
  },
};

/**
 * Metric collection intervals (in milliseconds)
 */
export const METRIC_INTERVALS = {
  REAL_TIME: 5000, // 5 seconds
  FREQUENT: 30000, // 30 seconds
  NORMAL: 60000, // 1 minute
  SLOW: 300000, // 5 minutes
  HOURLY: 3600000, // 1 hour
};

/**
 * Data retention policies
 */
export const RETENTION_POLICIES = {
  RAW_METRICS: {
    development: '1d',
    staging: '7d',
    production: '30d',
  },
  AGGREGATED_METRICS: {
    development: '7d',
    staging: '30d',
    production: '90d',
  },
  ALERTS: {
    development: '7d',
    staging: '30d',
    production: '365d',
  },
  LOGS: {
    development: '1d',
    staging: '7d',
    production: '30d',
  },
};

/**
 * Production Monitoring and Alerting Configuration
 *
 * Provides comprehensive monitoring dashboards, performance alerts,
 * and error rate monitoring for production environments.
 */

import { MonitoringDashboard } from './monitoring-wrapper';
import { PerformanceAlerting } from './performance-alerting';

/**
 * Production monitoring configuration
 */
export interface ProductionMonitoringConfig {
  // Dashboard settings
  dashboardRefreshInterval: number;
  metricsRetentionDays: number;

  // Alert thresholds
  errorRateThreshold: number;
  responseTimeThreshold: number;
  throughputThreshold: number;

  // Notification settings
  alertWebhookUrl?: string;
  emailNotifications?: string[];
  slackWebhookUrl?: string;

  // Environment settings
  environment: 'production' | 'staging' | 'development';
  serviceName: string;
  version: string;
}

/**
 * Default production monitoring configuration
 */
const DEFAULT_CONFIG: ProductionMonitoringConfig = {
  dashboardRefreshInterval: 30000, // 30 seconds
  metricsRetentionDays: 30,
  errorRateThreshold: 0.05, // 5% error rate
  responseTimeThreshold: 2000, // 2 seconds
  throughputThreshold: 100, // requests per minute
  environment: 'production',
  serviceName: 'complaint-system',
  version: '1.0.0',
};

/**
 * Production monitoring manager
 */
export class ProductionMonitoringManager {
  private config: ProductionMonitoringConfig;
  private alerting: PerformanceAlerting;
  private dashboardInterval?: NodeJS.Timeout;
  private isInitialized = false;

  constructor(config: Partial<ProductionMonitoringConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.alerting = new PerformanceAlerting();
  }

  /**
   * Initialize production monitoring
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('Production monitoring already initialized');
      return;
    }

    try {
      // Configure monitoring dashboard
      await this.configureDashboard();

      // Set up performance alerts
      await this.configureAlerts();

      // Start monitoring loops
      this.startMonitoringLoops();

      this.isInitialized = true;
      console.log('Production monitoring initialized successfully');
    } catch (error) {
      console.error('Failed to initialize production monitoring:', error);
      throw error;
    }
  }

  /**
   * Configure monitoring dashboard
   */
  private async configureDashboard(): Promise<void> {
    // Set up API metrics dashboard
    MonitoringDashboard.configureDashboard({
      title: `${this.config.serviceName} API Metrics`,
      refreshInterval: this.config.dashboardRefreshInterval,
      environment: this.config.environment,
      version: this.config.version,
      panels: [
        {
          title: 'Request Rate',
          type: 'line',
          metrics: ['api_requests_total'],
          timeRange: '1h',
        },
        {
          title: 'Response Time',
          type: 'line',
          metrics: ['api_response_time_ms'],
          timeRange: '1h',
        },
        {
          title: 'Error Rate',
          type: 'line',
          metrics: ['api_errors_total'],
          timeRange: '1h',
        },
        {
          title: 'Active Connections',
          type: 'gauge',
          metrics: ['realtime_connections_active'],
          timeRange: '5m',
        },
        {
          title: 'Cache Hit Rate',
          type: 'gauge',
          metrics: ['cache_hit_rate'],
          timeRange: '15m',
        },
        {
          title: 'Database Connections',
          type: 'gauge',
          metrics: ['database_connections_active'],
          timeRange: '5m',
        },
      ],
    });

    // Set up error tracking dashboard
    MonitoringDashboard.configureDashboard({
      title: `${this.config.serviceName} Error Tracking`,
      refreshInterval: this.config.dashboardRefreshInterval,
      environment: this.config.environment,
      version: this.config.version,
      panels: [
        {
          title: 'Error Types',
          type: 'pie',
          metrics: ['api_errors_by_type'],
          timeRange: '1h',
        },
        {
          title: 'Error Trends',
          type: 'line',
          metrics: ['api_errors_total'],
          timeRange: '24h',
        },
        {
          title: 'Top Error Endpoints',
          type: 'table',
          metrics: ['api_errors_by_endpoint'],
          timeRange: '1h',
        },
      ],
    });

    // Set up performance dashboard
    MonitoringDashboard.configureDashboard({
      title: `${this.config.serviceName} Performance`,
      refreshInterval: this.config.dashboardRefreshInterval,
      environment: this.config.environment,
      version: this.config.version,
      panels: [
        {
          title: 'P95 Response Time',
          type: 'line',
          metrics: ['api_response_time_p95'],
          timeRange: '1h',
        },
        {
          title: 'P99 Response Time',
          type: 'line',
          metrics: ['api_response_time_p99'],
          timeRange: '1h',
        },
        {
          title: 'Throughput',
          type: 'line',
          metrics: ['api_throughput_rpm'],
          timeRange: '1h',
        },
        {
          title: 'Memory Usage',
          type: 'line',
          metrics: ['memory_usage_mb'],
          timeRange: '1h',
        },
      ],
    });
  }

  /**
   * Configure performance alerts
   */
  private async configureAlerts(): Promise<void> {
    // Error rate alert
    this.alerting.addAlert({
      name: 'high_error_rate',
      description: 'API error rate is above threshold',
      metric: 'api_error_rate',
      threshold: this.config.errorRateThreshold,
      operator: '>',
      duration: '5m',
      severity: 'critical',
      notifications: this.getNotificationChannels(),
    });

    // Response time alert
    this.alerting.addAlert({
      name: 'high_response_time',
      description: 'API response time is above threshold',
      metric: 'api_response_time_p95',
      threshold: this.config.responseTimeThreshold,
      operator: '>',
      duration: '5m',
      severity: 'warning',
      notifications: this.getNotificationChannels(),
    });

    // Low throughput alert
    this.alerting.addAlert({
      name: 'low_throughput',
      description: 'API throughput is below threshold',
      metric: 'api_throughput_rpm',
      threshold: this.config.throughputThreshold,
      operator: '<',
      duration: '10m',
      severity: 'warning',
      notifications: this.getNotificationChannels(),
    });

    // Database connection alert
    this.alerting.addAlert({
      name: 'database_connection_issues',
      description: 'Database connection pool is exhausted',
      metric: 'database_connections_active',
      threshold: 80, // 80% of pool size
      operator: '>',
      duration: '2m',
      severity: 'critical',
      notifications: this.getNotificationChannels(),
    });

    // Real-time connection alert
    this.alerting.addAlert({
      name: 'realtime_connection_drop',
      description: 'Real-time connections dropped significantly',
      metric: 'realtime_connections_active',
      threshold: 0.5, // 50% drop
      operator: '<',
      duration: '1m',
      severity: 'warning',
      notifications: this.getNotificationChannels(),
    });

    // Cache performance alert
    this.alerting.addAlert({
      name: 'low_cache_hit_rate',
      description: 'Cache hit rate is below optimal threshold',
      metric: 'cache_hit_rate',
      threshold: 0.8, // 80% hit rate
      operator: '<',
      duration: '15m',
      severity: 'info',
      notifications: this.getNotificationChannels(),
    });
  }

  /**
   * Get notification channels configuration
   */
  private getNotificationChannels(): Array<{
    type: string;
    config: Record<string, any>;
  }> {
    const channels: Array<{ type: string; config: Record<string, any> }> = [];

    if (this.config.alertWebhookUrl) {
      channels.push({
        type: 'webhook',
        config: {
          url: this.config.alertWebhookUrl,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      });
    }

    if (this.config.emailNotifications?.length) {
      channels.push({
        type: 'email',
        config: {
          recipients: this.config.emailNotifications,
          subject: `${this.config.serviceName} Alert`,
        },
      });
    }

    if (this.config.slackWebhookUrl) {
      channels.push({
        type: 'slack',
        config: {
          webhookUrl: this.config.slackWebhookUrl,
          channel: '#alerts',
          username: 'MonitoringBot',
        },
      });
    }

    return channels;
  }

  /**
   * Start monitoring loops
   */
  private startMonitoringLoops(): void {
    // Dashboard refresh loop
    this.dashboardInterval = setInterval(() => {
      this.refreshDashboards();
    }, this.config.dashboardRefreshInterval);

    // Metrics collection loop
    setInterval(() => {
      this.collectSystemMetrics();
    }, 60000); // Every minute

    // Alert evaluation loop
    setInterval(() => {
      this.alerting.evaluateAlerts();
    }, 30000); // Every 30 seconds
  }

  /**
   * Refresh monitoring dashboards
   */
  private async refreshDashboards(): Promise<void> {
    try {
      // Refresh API metrics
      const apiMetrics = await MonitoringDashboard.getMetrics({
        timeRange: '1h',
        categories: ['api', 'complaints', 'notifications'],
      });

      // Refresh error metrics
      const errorMetrics = await MonitoringDashboard.getErrorMetrics({
        timeRange: '1h',
        groupBy: ['type', 'endpoint'],
      });

      // Refresh performance metrics
      const performanceMetrics = await MonitoringDashboard.getPerformanceMetrics({
        timeRange: '1h',
        percentiles: [50, 95, 99],
      });

      // Update dashboard data
      MonitoringDashboard.updateDashboardData({
        api: apiMetrics,
        errors: errorMetrics,
        performance: performanceMetrics,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to refresh dashboards:', error);
    }
  }

  /**
   * Collect system metrics
   */
  private collectSystemMetrics(): void {
    try {
      // Memory usage
      if (typeof process !== 'undefined' && process.memoryUsage) {
        const memUsage = process.memoryUsage();
        MonitoringDashboard.recordMetric({
          operation: 'system_metrics',
          category: 'system',
          metric: 'memory_usage_mb',
          value: memUsage.heapUsed / 1024 / 1024,
          tags: {
            type: 'heap_used',
            environment: this.config.environment,
          },
        });
      }

      // Active connections (if available)
      const activeConnections = this.getActiveConnectionCount();
      if (activeConnections !== null) {
        MonitoringDashboard.recordMetric({
          operation: 'system_metrics',
          category: 'realtime',
          metric: 'realtime_connections_active',
          value: activeConnections,
          tags: {
            environment: this.config.environment,
          },
        });
      }
    } catch (error) {
      console.error('Failed to collect system metrics:', error);
    }
  }

  /**
   * Get active connection count (placeholder - implement based on your real-time system)
   */
  private getActiveConnectionCount(): number | null {
    // This would be implemented based on your specific real-time connection tracking
    // For now, return null to indicate unavailable
    return null;
  }

  /**
   * Get monitoring status
   */
  getStatus(): {
    initialized: boolean;
    config: ProductionMonitoringConfig;
    alertsActive: number;
    dashboardsActive: number;
  } {
    return {
      initialized: this.isInitialized,
      config: this.config,
      alertsActive: this.alerting.getActiveAlerts().length,
      dashboardsActive: MonitoringDashboard.getActiveDashboards().length,
    };
  }

  /**
   * Shutdown monitoring
   */
  async shutdown(): Promise<void> {
    if (this.dashboardInterval) {
      clearInterval(this.dashboardInterval);
    }

    await this.alerting.shutdown();
    this.isInitialized = false;
    console.log('Production monitoring shutdown complete');
  }
}

/**
 * Global production monitoring instance
 */
export const productionMonitoring = new ProductionMonitoringManager();

/**
 * Initialize production monitoring with environment-specific configuration
 */
export async function initializeProductionMonitoring(
  config?: Partial<ProductionMonitoringConfig>
): Promise<void> {
  const environment = process.env.NODE_ENV || 'development';

  const envConfig: Partial<ProductionMonitoringConfig> = {
    environment: environment as 'production' | 'staging' | 'development',
    serviceName: process.env.SERVICE_NAME || 'complaint-system',
    version: process.env.SERVICE_VERSION || '1.0.0',
    alertWebhookUrl: process.env.ALERT_WEBHOOK_URL,
    emailNotifications: process.env.ALERT_EMAILS?.split(','),
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
    ...config,
  };

  const monitoring = new ProductionMonitoringManager(envConfig);
  await monitoring.initialize();
}

/**
 * Health check endpoint data
 */
export function getHealthCheckData(): {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  version: string;
  environment: string;
  monitoring: {
    initialized: boolean;
    alertsActive: number;
    dashboardsActive: number;
  };
  metrics: {
    errorRate: number;
    avgResponseTime: number;
    throughput: number;
  };
} {
  const status = productionMonitoring.getStatus();

  // Get recent metrics for health assessment
  const recentMetrics = MonitoringDashboard.getRecentMetrics([
    'api_error_rate',
    'api_response_time_avg',
    'api_throughput_rpm',
  ]);

  const errorRate = recentMetrics.api_error_rate || 0;
  const avgResponseTime = recentMetrics.api_response_time_avg || 0;
  const throughput = recentMetrics.api_throughput_rpm || 0;

  // Determine overall health status
  let healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  if (errorRate > 0.1 || avgResponseTime > 5000) {
    healthStatus = 'unhealthy';
  } else if (errorRate > 0.05 || avgResponseTime > 2000) {
    healthStatus = 'degraded';
  }

  return {
    status: healthStatus,
    timestamp: Date.now(),
    version: status.config.version,
    environment: status.config.environment,
    monitoring: {
      initialized: status.initialized,
      alertsActive: status.alertsActive,
      dashboardsActive: status.dashboardsActive,
    },
    metrics: {
      errorRate,
      avgResponseTime,
      throughput,
    },
  };
}

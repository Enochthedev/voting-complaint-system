/**
 * Monitoring System Initialization
 *
 * Initializes the monitoring system based on environment configuration
 */

import { initializeProductionMonitoring } from '@/lib/api/standardization/production-monitoring';
import { getMonitoringConfig, MONITORING_FEATURES } from '@/lib/config/monitoring';

/**
 * Initialize monitoring system
 */
export async function initializeMonitoring(): Promise<void> {
  // Skip initialization if monitoring is disabled
  if (!MONITORING_FEATURES.ENABLED) {
    console.log('Monitoring disabled by configuration');
    return;
  }

  try {
    console.log('Initializing monitoring system...');

    // Get environment-specific configuration
    const config = getMonitoringConfig();

    // Initialize production monitoring
    await initializeProductionMonitoring(config);

    console.log('Monitoring system initialized successfully');
    console.log('Features enabled:', {
      dashboard: MONITORING_FEATURES.DASHBOARD_ENABLED,
      alerts: MONITORING_FEATURES.ALERTS_ENABLED,
      performance: MONITORING_FEATURES.PERFORMANCE_MONITORING,
      errorTracking: MONITORING_FEATURES.ERROR_TRACKING,
    });
  } catch (error) {
    console.error('Failed to initialize monitoring system:', error);

    // In production, we might want to continue without monitoring
    // rather than failing the entire application startup
    if (process.env.NODE_ENV === 'production') {
      console.warn('Continuing without monitoring due to initialization failure');
    } else {
      throw error;
    }
  }
}

/**
 * Graceful shutdown of monitoring system
 */
export async function shutdownMonitoring(): Promise<void> {
  if (!MONITORING_FEATURES.ENABLED) {
    return;
  }

  try {
    console.log('Shutting down monitoring system...');

    // Import and shutdown production monitoring
    const { productionMonitoring } = await import(
      '@/lib/api/standardization/production-monitoring'
    );
    await productionMonitoring.shutdown();

    console.log('Monitoring system shutdown complete');
  } catch (error) {
    console.error('Error during monitoring shutdown:', error);
  }
}

/**
 * Health check for monitoring system
 */
export function getMonitoringHealth(): {
  status: 'healthy' | 'degraded' | 'unhealthy';
  features: Record<string, boolean>;
  config: {
    environment: string;
    serviceName: string;
    version: string;
  };
} {
  const config = getMonitoringConfig();

  return {
    status: MONITORING_FEATURES.ENABLED ? 'healthy' : 'degraded',
    features: {
      monitoring: MONITORING_FEATURES.ENABLED,
      dashboard: MONITORING_FEATURES.DASHBOARD_ENABLED,
      alerts: MONITORING_FEATURES.ALERTS_ENABLED,
      performance: MONITORING_FEATURES.PERFORMANCE_MONITORING,
      errorTracking: MONITORING_FEATURES.ERROR_TRACKING,
      cacheMonitoring: MONITORING_FEATURES.CACHE_MONITORING,
    },
    config: {
      environment: config.environment || 'unknown',
      serviceName: config.serviceName || 'unknown',
      version: config.version || 'unknown',
    },
  };
}

// Auto-initialize monitoring in production environments
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  // Only initialize on server-side in production
  initializeMonitoring().catch(console.error);

  // Set up graceful shutdown handlers
  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down monitoring...');
    await shutdownMonitoring();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down monitoring...');
    await shutdownMonitoring();
    process.exit(0);
  });
}

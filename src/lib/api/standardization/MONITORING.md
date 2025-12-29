# API Monitoring and Observability

This document describes the API monitoring and observability system implemented for the complaint management system.

## Overview

The monitoring system provides comprehensive observability for all API calls including:

- **Performance Metrics**: Response times, success rates, throughput
- **Error Logging**: Detailed error context and stack traces
- **Performance Alerting**: Automated alerts for degraded performance
- **Request Tracing**: Unique identifiers for request correlation
- **Dashboard Data**: Real-time monitoring statistics

## Components

### 1. ApiMonitor Class (`api-monitor.ts`)

Core monitoring functionality for metrics collection:

```typescript
import { apiMonitor } from '@/lib/api/standardization/api-monitor';

// Start tracking a request
const requestId = apiMonitor.startRequest('/api/complaints', 'GET', 'user-123');

// End tracking (success)
apiMonitor.endRequest(requestId, true);

// End tracking (failure)
apiMonitor.endRequest(requestId, false, new Error('Database error'));

// Get statistics
const stats = apiMonitor.getStats();
console.log(`Success rate: ${stats.successRate * 100}%`);
```

### 2. Performance Alerting (`performance-alerting.ts`)

Automated alerting for performance issues:

```typescript
import { performanceAlerting } from '@/lib/api/standardization/performance-alerting';

// Add custom alert rule
performanceAlerting.addRule({
  id: 'custom-slow-api',
  name: 'Slow API Response',
  enabled: true,
  conditions: {
    metric: 'response_time',
    operator: 'gt',
    threshold: 3000, // 3 seconds
    timeWindow: 300000, // 5 minutes
    minSamples: 5,
  },
  severity: 'warning',
  cooldown: 600000, // 10 minutes
  actions: [{ type: 'log', config: { level: 'warn' } }],
});

// Check for alerts manually
const alerts = await performanceAlerting.checkAlerts();
```

### 3. Monitoring Wrapper (`monitoring-wrapper.ts`)

Easy integration with existing API functions:

```typescript
import { withMonitoring, monitorApiCall } from '@/lib/api/standardization/monitoring-wrapper';

// Wrap existing function
const monitoredFunction = withMonitoring(originalApiFunction, {
  endpoint: '/api/complaints',
  method: 'POST',
});

// Quick wrapper for new functions
const createComplaint = monitorApiCall('/api/complaints', 'POST', async (data) => {
  // API implementation
  return result;
});
```

## Integration Guide

### Step 1: Wrap Existing API Functions

Update your existing API functions to include monitoring:

```typescript
// Before
export const getUserComplaints = withRateLimit(getUserComplaintsImpl, 'read');

// After
export const getUserComplaints = withRateLimit(
  withMonitoring(getUserComplaintsImpl, { endpoint: '/api/complaints/user', method: 'GET' }),
  'read'
);
```

### Step 2: Use the Integration Script

Run the automated integration script:

```bash
node scripts/integrate-monitoring.js
```

This will automatically wrap existing API functions with monitoring.

### Step 3: Access Monitoring Data

Use the dashboard endpoints to access monitoring data:

- `GET /api/monitoring/stats` - Performance statistics
- `GET /api/monitoring/health` - System health summary
- `GET /api/monitoring/alerts` - Performance alerts
- `GET /api/monitoring/trends` - Performance trends over time

## Dashboard Integration

### Real-time Statistics

```typescript
import { MonitoringDashboard } from '@/lib/api/standardization/monitoring-wrapper';

// Get dashboard data
const dashboardData = await MonitoringDashboard.getStats();

console.log('Total requests:', dashboardData.stats.totalRequests);
console.log('Success rate:', dashboardData.stats.successRate);
console.log('Average response time:', dashboardData.stats.averageDuration);
```

### Health Monitoring

```typescript
// Check system health
const health = await MonitoringDashboard.getHealthSummary();

if (health.status === 'critical') {
  console.error('System is experiencing critical issues');
} else if (health.status === 'warning') {
  console.warn('System has performance warnings');
}
```

### Performance Trends

```typescript
// Get performance trends for charts
const trends = await MonitoringDashboard.getPerformanceTrends(
  24 * 60 * 60 * 1000, // 24 hours
  60 * 60 * 1000 // 1 hour buckets
);

// Use trends data for dashboard charts
trends.forEach((bucket) => {
  console.log(`${bucket.timestamp}: ${bucket.avgDuration}ms avg`);
});
```

## Configuration

### Global Configuration

```typescript
import { updateMonitoringConfig } from '@/lib/api/standardization/monitoring-wrapper';

// Update global monitoring settings
updateMonitoringConfig({
  enabled: true,
  collectMetrics: true,
  enableAlerting: true,
  traceRequests: true,
  logErrors: true,
});
```

### Alert Thresholds

```typescript
import { performanceAlerting } from '@/lib/api/standardization/performance-alerting';

// Update alert thresholds
performanceAlerting.updateAlertThresholds({
  responseTime: {
    warning: 1500, // 1.5 seconds
    critical: 4000, // 4 seconds
  },
  errorRate: {
    warning: 0.03, // 3%
    critical: 0.1, // 10%
  },
});
```

## Best Practices

### 1. Endpoint Naming

Use consistent endpoint naming for better grouping:

```typescript
// Good
{ endpoint: '/api/complaints/user', method: 'GET' }
{ endpoint: '/api/complaints', method: 'POST' }
{ endpoint: '/api/complaints/[id]', method: 'PUT' }

// Avoid
{ endpoint: '/api/getUserComplaints', method: 'GET' }
```

### 2. Metadata Usage

Include relevant metadata for better debugging:

```typescript
withMonitoring(apiFunction, {
  endpoint: '/api/complaints',
  method: 'POST',
  metadata: {
    feature: 'complaint-creation',
    version: '1.0',
    userId: currentUser.id,
  },
});
```

### 3. Error Context

Ensure errors include sufficient context:

```typescript
try {
  // API operation
} catch (error) {
  // Error will be automatically logged with context
  throw new DatabaseError(
    'Failed to create complaint',
    error.code,
    undefined,
    error.details,
    error.hint
  );
}
```

## Monitoring Endpoints

### GET /api/monitoring/stats

Returns performance statistics:

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalRequests": 1250,
      "successfulRequests": 1200,
      "failedRequests": 50,
      "successRate": 0.96,
      "averageDuration": 245,
      "p95Duration": 850,
      "p99Duration": 1200
    },
    "topEndpoints": [
      {
        "endpoint": "GET /api/complaints",
        "requests": 450,
        "avgDuration": 180,
        "errorRate": 0.02
      }
    ]
  }
}
```

### GET /api/monitoring/health

Returns system health:

```json
{
  "success": true,
  "status": "healthy",
  "summary": {
    "totalRequests": 1250,
    "successRate": 0.96,
    "averageResponseTime": 245,
    "activeAlerts": 0,
    "criticalAlerts": 0
  },
  "uptime": 86400,
  "memoryUsage": {
    "rss": 45678912,
    "heapTotal": 32456789,
    "heapUsed": 28123456
  }
}
```

### GET /api/monitoring/alerts

Returns performance alerts:

```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert-123",
        "type": "response_time",
        "severity": "warning",
        "message": "Slow response time detected: 2500ms",
        "endpoint": "/api/complaints",
        "threshold": 2000,
        "actualValue": 2500,
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ],
    "stats": {
      "totalAlerts": 5,
      "alertsBySeverity": {
        "warning": 4,
        "critical": 1
      }
    }
  }
}
```

## Troubleshooting

### High Memory Usage

If monitoring is using too much memory:

```typescript
// Reduce metrics history
apiMonitor.cleanup(24 * 60 * 60 * 1000); // Keep only last 24 hours

// Or disable monitoring temporarily
updateMonitoringConfig({ enabled: false });
```

### Missing Metrics

If metrics aren't being collected:

1. Check that monitoring is enabled
2. Verify API functions are wrapped with `withMonitoring`
3. Check console for monitoring errors
4. Ensure imports are correct

### Alert Spam

If getting too many alerts:

```typescript
// Increase cooldown periods
performanceAlerting.updateRule('rule-id', {
  cooldown: 1800000, // 30 minutes
});

// Or adjust thresholds
performanceAlerting.updateRule('rule-id', {
  conditions: {
    ...existingConditions,
    threshold: 3000, // Increase threshold
  },
});
```

## Performance Impact

The monitoring system is designed to have minimal performance impact:

- **Overhead**: < 1ms per request
- **Memory**: ~100KB for 10,000 metrics
- **CPU**: Negligible during normal operation
- **Storage**: Metrics are kept in memory only

For production environments, consider:

- Regular cleanup of old metrics
- Adjusting alert thresholds based on actual usage
- Monitoring the monitoring system itself

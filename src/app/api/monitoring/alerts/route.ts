/**
 * Monitoring Alerts API Route
 *
 * Provides access to alert configuration and status
 */

import { NextRequest, NextResponse } from 'next/server';
import { productionMonitoring } from '@/lib/api/standardization/production-monitoring';
import { PerformanceAlertingSystem } from '@/lib/api/standardization/performance-alerting';

// Create alerting instance for API operations
const alerting = new PerformanceAlertingSystem();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active', 'resolved', 'all'
    const severity = searchParams.get('severity'); // 'critical', 'warning', 'info'
    const timeRange = searchParams.get('timeRange') || '24h';

    let alerts;

    if (status === 'active') {
      alerts = alerting.getActiveAlerts();
    } else if (status === 'resolved') {
      alerts = alerting.getResolvedAlerts(timeRange);
    } else {
      alerts = alerting.getAllAlerts(timeRange);
    }

    // Filter by severity if specified
    if (severity) {
      alerts = alerts.filter((alert) => alert.severity === severity);
    }

    return NextResponse.json({
      alerts,
      summary: {
        total: alerts.length,
        active: alerting.getActiveAlerts().length,
        critical: alerts.filter((a) => a.severity === 'critical').length,
        warning: alerts.filter((a) => a.severity === 'warning').length,
        info: alerts.filter((a) => a.severity === 'info').length,
      },
      timestamp: Date.now(),
      monitoringStatus: productionMonitoring.getStatus(),
    });
  } catch (error) {
    console.error('Alerts API error:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, alertId, config } = body;

    switch (action) {
      case 'acknowledge':
        if (!alertId) {
          return NextResponse.json({ error: 'Alert ID required' }, { status: 400 });
        }
        await alerting.acknowledgeAlert(alertId, config?.userId, config?.comment);
        return NextResponse.json({ success: true });

      case 'resolve':
        if (!alertId) {
          return NextResponse.json({ error: 'Alert ID required' }, { status: 400 });
        }
        await alerting.resolveAlert(alertId, config?.userId, config?.comment);
        return NextResponse.json({ success: true });

      case 'snooze':
        if (!alertId || !config?.duration) {
          return NextResponse.json({ error: 'Alert ID and duration required' }, { status: 400 });
        }
        await alerting.snoozeAlert(alertId, config.duration, config?.userId);
        return NextResponse.json({ success: true });

      case 'create':
        if (!config) {
          return NextResponse.json({ error: 'Alert configuration required' }, { status: 400 });
        }
        const newAlertId = await alerting.addAlert(config);
        return NextResponse.json({ success: true, alertId: newAlertId });

      case 'update':
        if (!alertId || !config) {
          return NextResponse.json(
            { error: 'Alert ID and configuration required' },
            { status: 400 }
          );
        }
        await alerting.updateAlert(alertId, config);
        return NextResponse.json({ success: true });

      case 'delete':
        if (!alertId) {
          return NextResponse.json({ error: 'Alert ID required' }, { status: 400 });
        }
        await alerting.removeAlert(alertId);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Alert action error:', error);
    return NextResponse.json({ error: 'Failed to perform alert action' }, { status: 500 });
  }
}

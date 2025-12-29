/**
 * Monitoring Dashboard API Route
 *
 * Provides access to monitoring dashboard data and configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { MonitoringDashboard } from '@/lib/api/standardization/monitoring-wrapper';
import { productionMonitoring } from '@/lib/api/standardization/production-monitoring';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '1h';
    const category = searchParams.get('category');
    const dashboard = searchParams.get('dashboard') || 'overview';

    let data;

    switch (dashboard) {
      case 'overview':
        data = await MonitoringDashboard.getMetrics({
          timeRange,
          categories: category ? [category] : ['api', 'complaints', 'notifications'],
        });
        break;

      case 'errors':
        data = await MonitoringDashboard.getErrorMetrics({
          timeRange,
          groupBy: ['type', 'endpoint'],
        });
        break;

      case 'performance':
        data = await MonitoringDashboard.getPerformanceMetrics({
          timeRange,
          percentiles: [50, 95, 99],
        });
        break;

      case 'realtime':
        data = await MonitoringDashboard.getRealtimeMetrics({
          timeRange,
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid dashboard type' }, { status: 400 });
    }

    return NextResponse.json({
      dashboard,
      timeRange,
      category,
      data,
      timestamp: Date.now(),
      status: productionMonitoring.getStatus(),
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, config } = body;

    switch (action) {
      case 'configure':
        await MonitoringDashboard.configureDashboard(config);
        return NextResponse.json({ success: true });

      case 'refresh':
        await MonitoringDashboard.refreshDashboard(config.dashboardId);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Dashboard configuration error:', error);
    return NextResponse.json({ error: 'Failed to configure dashboard' }, { status: 500 });
  }
}

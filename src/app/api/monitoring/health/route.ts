/**
 * Health Check API Route
 *
 * Provides system health status and monitoring information
 */

import { NextResponse } from 'next/response';
import { getHealthCheckData } from '@/lib/api/standardization/production-monitoring';

export async function GET() {
  try {
    const healthData = getHealthCheckData();

    // Set appropriate HTTP status based on health
    let status = 200;
    if (healthData.status === 'degraded') {
      status = 200; // Still OK, but with warnings
    } else if (healthData.status === 'unhealthy') {
      status = 503; // Service unavailable
    }

    return NextResponse.json(healthData, { status });
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: Date.now(),
        error: 'Health check failed',
        monitoring: {
          initialized: false,
          alertsActive: 0,
          dashboardsActive: 0,
        },
        metrics: {
          errorRate: 1.0,
          avgResponseTime: 0,
          throughput: 0,
        },
      },
      { status: 503 }
    );
  }
}

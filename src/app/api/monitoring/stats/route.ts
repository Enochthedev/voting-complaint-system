/**
 * Monitoring Statistics API Endpoint
 *
 * Provides real-time monitoring statistics for the dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { MonitoringDashboard } from '@/lib/api/standardization/monitoring-wrapper';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange');

    // Parse time range (default to 24 hours)
    let timeRangeMs = 24 * 60 * 60 * 1000; // 24 hours

    if (timeRange) {
      const parsed = parseInt(timeRange);
      if (!isNaN(parsed) && parsed > 0) {
        timeRangeMs = parsed;
      }
    }

    const stats = await MonitoringDashboard.getStats(timeRangeMs);

    return NextResponse.json({
      success: true,
      data: stats,
      timeRange: timeRangeMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching monitoring stats:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch monitoring statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

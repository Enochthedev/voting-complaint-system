/**
 * Performance Trends API Endpoint
 *
 * Provides performance trends over time for dashboard charts
 */

import { NextRequest, NextResponse } from 'next/server';
import { MonitoringDashboard } from '@/lib/api/standardization/monitoring-wrapper';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange');
    const bucketSize = searchParams.get('bucketSize');

    // Parse time range (default to 24 hours)
    let timeRangeMs = 24 * 60 * 60 * 1000; // 24 hours
    if (timeRange) {
      const parsed = parseInt(timeRange);
      if (!isNaN(parsed) && parsed > 0) {
        timeRangeMs = parsed;
      }
    }

    // Parse bucket size (default to 1 hour)
    let bucketSizeMs = 60 * 60 * 1000; // 1 hour
    if (bucketSize) {
      const parsed = parseInt(bucketSize);
      if (!isNaN(parsed) && parsed > 0) {
        bucketSizeMs = parsed;
      }
    }

    const trends = await MonitoringDashboard.getPerformanceTrends(timeRangeMs, bucketSizeMs);

    return NextResponse.json({
      success: true,
      data: trends,
      timeRange: timeRangeMs,
      bucketSize: bucketSizeMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching performance trends:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch performance trends',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

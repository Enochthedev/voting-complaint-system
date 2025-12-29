/**
 * Complaints API V1 Route Handler
 *
 * Provides backward compatibility for V1 complaints API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createVersionedHandler, ApiVersion } from '@/lib/api/standardization/version-manager';
import { CompatibilityManager } from '@/lib/api/standardization/compatibility-layer';
import { apiClient } from '@/lib/api/standardization/client';
import type { StandardApiResponse } from '@/lib/api/standardization/types';

/**
 * V1 Complaints Handler
 */
async function handleV1Complaints(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Use the standardized client to fetch complaints
    const response = await apiClient.paginatedRequest(
      async (offset, limit) => {
        // This would typically call your Supabase client or database
        // For now, return mock data structure
        return {
          data: [
            {
              id: '1',
              title: 'Sample Complaint V1',
              description: 'This is a V1 format complaint',
              status: 'open',
              category: 'academic',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              metadata: {
                id: '1',
                type: 'complaint',
              },
            },
          ],
          count: 1,
        };
      },
      page,
      limit,
      {
        cacheKey: `complaints-v1-${page}-${limit}`,
        cacheTtl: 300000, // 5 minutes
        context: {
          requestId: crypto.randomUUID(),
          endpoint: '/api/v1/complaints',
          method: 'GET',
        },
      }
    );

    if (response.error) {
      return NextResponse.json(response, { status: 400 });
    }

    // Transform response to V1 format
    const v1Response = CompatibilityManager.transformPaginatedResponse(
      response as any,
      ApiVersion.V2,
      ApiVersion.V1,
      {
        requestId: crypto.randomUUID(),
        originalVersion: ApiVersion.V2,
        targetVersion: ApiVersion.V1,
        endpoint: '/api/v1/complaints',
        method: 'GET',
      }
    );

    return NextResponse.json(v1Response, {
      status: 200,
      headers: {
        'X-API-Version': ApiVersion.V1,
        'X-Deprecation-Warning': 'V1 API is deprecated. Please migrate to V2.',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('V1 Complaints API error:', error);

    const errorResponse: StandardApiResponse<null> = {
      data: null,
      error: {
        type: 'server_error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An internal server error occurred',
        timestamp: new Date().toISOString(),
      },
      meta: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        version: ApiVersion.V1,
        timing: {
          duration: 0,
          timestamp: new Date().toISOString(),
        },
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * V2 Complaints Handler (with enhanced features)
 */
async function handleV2Complaints(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Use the standardized client to fetch complaints
    const response = await apiClient.paginatedRequest(
      async (offset, limit) => {
        // This would typically call your Supabase client or database
        // V2 includes enhanced metadata and features
        return {
          data: [
            {
              id: '1',
              title: 'Sample Complaint V2',
              description: 'This is a V2 format complaint with enhanced features',
              status: 'open',
              tags: ['academic', 'urgent'],
              created_at_iso: '2024-01-01T00:00:00.000Z',
              updated_at_iso: '2024-01-01T00:00:00.000Z',
              enhanced_metadata: {
                version: 'v2',
                features: ['real-time-updates', 'advanced-search'],
                compatibility_mode: false,
              },
              status_history: [
                {
                  status: 'open',
                  timestamp: '2024-01-01T00:00:00.000Z',
                  user_id: 'user-1',
                },
              ],
              real_time_updates: true,
              advanced_search_score: 0.95,
            },
          ],
          count: 1,
        };
      },
      page,
      limit,
      {
        cacheKey: `complaints-v2-${page}-${limit}`,
        cacheTtl: 300000, // 5 minutes
        context: {
          requestId: crypto.randomUUID(),
          endpoint: '/api/v2/complaints',
          method: 'GET',
        },
      }
    );

    if (response.error) {
      return NextResponse.json(response, { status: 400 });
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'X-API-Version': ApiVersion.V2,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('V2 Complaints API error:', error);

    const errorResponse: StandardApiResponse<null> = {
      data: null,
      error: {
        type: 'server_error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An internal server error occurred',
        timestamp: new Date().toISOString(),
      },
      meta: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        version: ApiVersion.V2,
        timing: {
          duration: 0,
          timestamp: new Date().toISOString(),
        },
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Create versioned handler
const versionedHandler = createVersionedHandler({
  [ApiVersion.V1]: handleV1Complaints,
  [ApiVersion.V2]: handleV2Complaints,
});

export { versionedHandler as GET };

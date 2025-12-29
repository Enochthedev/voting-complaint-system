/**
 * API Versioning System Usage Examples
 *
 * Demonstrates how to use the API versioning system in different scenarios
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  ApiVersion,
  ApiVersionManager,
  createVersionedHandler,
  VersionRouter,
  CompatibilityManager,
  versionedApiClient,
} from '../index';

/**
 * Example 1: Creating a versioned API route handler
 */
export function createVersionedComplaintsHandler() {
  // Define handlers for different versions
  const handleV1 = async (request: NextRequest): Promise<NextResponse> => {
    // V1 logic - simplified response format
    const complaints = [
      {
        id: '1',
        title: 'V1 Complaint',
        status: 'open',
        category: 'academic',
        created_at: '2024-01-01T00:00:00Z',
      },
    ];

    return NextResponse.json({
      data: complaints,
      total: complaints.length,
    });
  };

  const handleV2 = async (request: NextRequest): Promise<NextResponse> => {
    // V2 logic - enhanced response format
    const complaints = [
      {
        id: '1',
        title: 'V2 Complaint',
        status: 'open',
        tags: ['academic', 'urgent'],
        created_at_iso: '2024-01-01T00:00:00.000Z',
        enhanced_metadata: {
          version: 'v2',
          features: ['real-time-updates', 'advanced-search'],
        },
        status_history: [
          {
            status: 'open',
            timestamp: '2024-01-01T00:00:00.000Z',
            user_id: 'user-1',
          },
        ],
      },
    ];

    return NextResponse.json({
      data: complaints,
      meta: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        version: ApiVersion.V2,
        timing: {
          duration: 50,
          timestamp: new Date().toISOString(),
        },
        pagination: {
          page: 1,
          limit: 20,
          total: complaints.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
          links: {
            first: '/api/v2/complaints?page=1',
            prev: null,
            next: null,
            last: '/api/v2/complaints?page=1',
          },
        },
      },
    });
  };

  // Create versioned handler
  return createVersionedHandler({
    [ApiVersion.V1]: handleV1,
    [ApiVersion.V2]: handleV2,
  });
}

/**
 * Example 2: Using the version router for complex routing
 */
export function setupVersionedRoutes() {
  // Register versioned routes
  VersionRouter.registerRoutes([
    {
      path: '/api/complaints',
      method: 'GET',
      handlers: {
        [ApiVersion.V1]: async (request) => {
          // V1 implementation
          return NextResponse.json({ version: 'v1', data: [] });
        },
        [ApiVersion.V2]: async (request) => {
          // V2 implementation
          return NextResponse.json({ version: 'v2', data: [] });
        },
      },
      requiresAuth: true,
      rateLimit: {
        windowMs: 60000, // 1 minute
        maxRequests: 100,
      },
    },
    {
      path: '/api/notifications',
      method: 'GET',
      handlers: {
        [ApiVersion.V1]: async (request) => {
          return NextResponse.json({ version: 'v1', notifications: [] });
        },
        [ApiVersion.V2]: async (request) => {
          return NextResponse.json({ version: 'v2', notifications: [] });
        },
      },
      requiresAuth: true,
    },
  ]);
}

/**
 * Example 3: Client-side usage with version-aware API client
 */
export async function clientSideExamples() {
  // Example 1: Make a V1 API request
  const v1Response = await versionedApiClient.get('/api/complaints', {
    version: ApiVersion.V1,
  });

  if (v1Response.error) {
    console.error('V1 API Error:', v1Response.error);
    return;
  }

  console.log('V1 Data:', v1Response.data);

  // Example 2: Make a V2 API request with enhanced features
  const v2Response = await versionedApiClient.get('/api/complaints', {
    version: ApiVersion.V2,
  });

  if (v2Response.error) {
    console.error('V2 API Error:', v2Response.error);
    return;
  }

  console.log('V2 Data:', v2Response.data);
  console.log('V2 Metadata:', v2Response.meta);

  // Example 3: Make a paginated request
  const paginatedResponse = await versionedApiClient.getPaginated(
    '/api/complaints',
    1, // page
    20, // limit
    { version: ApiVersion.V2 }
  );

  if (paginatedResponse.error) {
    console.error('Paginated API Error:', paginatedResponse.error);
    return;
  }

  console.log('Paginated Data:', paginatedResponse.data);
  console.log('Pagination Info:', paginatedResponse.meta.pagination);

  // Example 4: Create a new complaint with V2 features
  const createResponse = await versionedApiClient.post(
    '/api/complaints',
    {
      title: 'New Complaint',
      description: 'This is a new complaint',
      tags: ['academic', 'urgent'],
      priority: 'high',
    },
    { version: ApiVersion.V2 }
  );

  if (createResponse.error) {
    console.error('Create API Error:', createResponse.error);
    return;
  }

  console.log('Created Complaint:', createResponse.data);
}

/**
 * Example 4: Version detection and compatibility handling
 */
export function versionDetectionExample(request: NextRequest) {
  // Detect version from request
  const versionResult = ApiVersionManager.detectVersion(request);

  console.log('Detected Version:', versionResult.version);
  console.log('Version Source:', versionResult.source);
  console.log('Is Deprecated:', versionResult.config.isDeprecated);

  // Check feature support
  const supportsAdvancedSearch = ApiVersionManager.supportsFeature(
    versionResult.version,
    'advanced-search'
  );

  console.log('Supports Advanced Search:', supportsAdvancedSearch);

  // Get version configuration
  const config = ApiVersionManager.getVersionConfig(versionResult.version);
  console.log('Version Config:', config);

  // Create version headers for response
  const headers = ApiVersionManager.createVersionHeaders(versionResult.version);
  console.log('Response Headers:', headers);
}

/**
 * Example 5: Data transformation between versions
 */
export function dataTransformationExample() {
  // V2 data format
  const v2Data = {
    id: '1',
    title: 'Sample Complaint',
    status: 'open',
    tags: ['academic', 'urgent'],
    created_at_iso: '2024-01-01T00:00:00.000Z',
    updated_at_iso: '2024-01-01T12:00:00.000Z',
    enhanced_metadata: {
      version: 'v2',
      features: ['real-time-updates'],
    },
    status_history: [
      {
        status: 'open',
        timestamp: '2024-01-01T00:00:00.000Z',
        user_id: 'user-1',
      },
    ],
  };

  // Transform V2 data to V1 format for backward compatibility
  const v1Data = CompatibilityManager.transformData(v2Data, ApiVersion.V2, ApiVersion.V1, {
    requestId: crypto.randomUUID(),
    originalVersion: ApiVersion.V2,
    targetVersion: ApiVersion.V1,
    endpoint: '/api/complaints',
    method: 'GET',
  });

  console.log('Original V2 Data:', v2Data);
  console.log('Transformed V1 Data:', v1Data);

  // Transform V1 data to V2 format
  const v1Input = {
    id: '2',
    title: 'Legacy Complaint',
    status: 'closed',
    category: 'facilities',
    created_at: '2024-01-01T00:00:00Z',
  };

  const v2Transformed = CompatibilityManager.transformData(v1Input, ApiVersion.V1, ApiVersion.V2, {
    requestId: crypto.randomUUID(),
    originalVersion: ApiVersion.V1,
    targetVersion: ApiVersion.V2,
    endpoint: '/api/complaints',
    method: 'POST',
  });

  console.log('Original V1 Data:', v1Input);
  console.log('Transformed V2 Data:', v2Transformed);
}

/**
 * Example 6: Middleware integration
 */
export function middlewareIntegrationExample() {
  // This would be used in your Next.js middleware.ts file
  return async function versioningMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip non-API routes
    if (!pathname.startsWith('/api/')) {
      return NextResponse.next();
    }

    // Detect version
    const versionResult = ApiVersionManager.detectVersion(request);

    // Create response with version headers
    const response = NextResponse.next();

    // Add version information
    response.headers.set('X-API-Version', versionResult.version);
    response.headers.set('X-Version-Source', versionResult.source);

    // Add deprecation warnings
    if (versionResult.config.isDeprecated) {
      response.headers.set('X-API-Deprecated', 'true');
      response.headers.set(
        'X-Deprecation-Warning',
        `API version ${versionResult.version} is deprecated. Please migrate to v2.`
      );
    }

    return response;
  };
}

/**
 * Example 7: Error handling with versioning
 */
export function errorHandlingExample() {
  try {
    // Simulate version mismatch error
    const errorResponse = ApiVersionManager.createVersionMismatchError(
      'v3', // Unsupported version
      [ApiVersion.V1, ApiVersion.V2]
    );

    console.log('Version Mismatch Error:', errorResponse);

    // Handle the error in your application
    if (errorResponse.error?.code === 'UNSUPPORTED_API_VERSION') {
      console.log('Supported versions:', errorResponse.error.details?.supportedVersions);
      // Redirect to supported version or show error message
    }
  } catch (error) {
    console.error('Error handling example failed:', error);
  }
}

/**
 * Run all examples
 */
export function runAllExamples() {
  console.log('=== API Versioning Examples ===\n');

  console.log('1. Version Detection Example:');
  // This would need a real NextRequest object
  // versionDetectionExample(request);

  console.log('\n2. Data Transformation Example:');
  dataTransformationExample();

  console.log('\n3. Error Handling Example:');
  errorHandlingExample();

  console.log('\n4. Setting up versioned routes:');
  setupVersionedRoutes();
  console.log('Routes registered successfully');

  console.log('\n=== Examples completed ===');
}

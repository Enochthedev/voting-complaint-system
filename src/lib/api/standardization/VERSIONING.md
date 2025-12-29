# API Versioning System

This document describes the comprehensive API versioning system implemented for the complaint management system. The system provides backward compatibility, version detection, and seamless migration paths between API versions.

## Overview

The API versioning system supports multiple API versions simultaneously while maintaining backward compatibility and providing clear migration paths. It includes:

- **Version Detection**: Automatic detection from headers, URL paths, or defaults
- **Backward Compatibility**: Automatic data transformation between versions
- **Version Management**: Centralized configuration and feature support
- **Client Utilities**: Version-aware API client for frontend applications
- **Middleware Integration**: Seamless integration with Next.js middleware

## Supported Versions

### V1 (Deprecated)

- **Status**: Deprecated (Sunset: 2025-01-01)
- **Features**: Basic CRUD, pagination, filtering
- **Backward Compatible**: Yes
- **Use Case**: Legacy applications, gradual migration

### V2 (Current)

- **Status**: Current default version
- **Features**: All V1 features plus advanced search, bulk operations, real-time updates, enhanced validation
- **Backward Compatible**: No (but provides compatibility layer)
- **Use Case**: New applications, enhanced features

## Version Detection

The system detects API versions in the following priority order:

1. **X-API-Version Header**: `X-API-Version: v2`
2. **Accept-Version Header**: `Accept-Version: v1`
3. **URL Path**: `/api/v1/complaints` or `/api/v2/complaints`
4. **Default**: Falls back to V2 if no version specified

### Examples

```typescript
// Header-based versioning
fetch('/api/complaints', {
  headers: {
    'X-API-Version': 'v1',
  },
});

// Path-based versioning
fetch('/api/v2/complaints');

// Default version (V2)
fetch('/api/complaints');
```

## Creating Versioned API Routes

### Basic Versioned Handler

```typescript
import { createVersionedHandler, ApiVersion } from '@/lib/api/standardization';

// Define handlers for each version
const handleV1 = async (request: NextRequest) => {
  // V1 implementation
  return NextResponse.json({
    data: complaints,
    total: complaints.length,
  });
};

const handleV2 = async (request: NextRequest) => {
  // V2 implementation with enhanced features
  return NextResponse.json({
    data: complaints,
    meta: {
      requestId: crypto.randomUUID(),
      version: 'v2',
      pagination: {
        /* ... */
      },
    },
  });
};

// Create versioned handler
export const GET = createVersionedHandler({
  [ApiVersion.V1]: handleV1,
  [ApiVersion.V2]: handleV2,
});
```

### Route Registration with Version Router

```typescript
import { VersionRouter } from '@/lib/api/standardization';

VersionRouter.registerRoutes([
  {
    path: '/api/complaints',
    method: 'GET',
    handlers: {
      [ApiVersion.V1]: handleV1,
      [ApiVersion.V2]: handleV2,
    },
    requiresAuth: true,
    rateLimit: {
      windowMs: 60000,
      maxRequests: 100,
    },
  },
]);
```

## Data Transformation

The system automatically transforms data between versions for backward compatibility.

### V2 to V1 Transformation

```typescript
// V2 format
const v2Data = {
  id: '1',
  title: 'Complaint',
  tags: ['academic', 'urgent'],
  created_at_iso: '2024-01-01T00:00:00.000Z',
  enhanced_metadata: { version: 'v2' },
  status_history: [
    /* ... */
  ],
};

// Automatically transformed to V1 format
const v1Data = {
  id: '1',
  title: 'Complaint',
  category: 'academic', // First tag becomes category
  created_at: '2024-01-01T00:00:00.000Z',
  metadata: { id: '1', type: 'complaint' },
  // V2-only fields removed
};
```

### Custom Transformations

```typescript
import { CompatibilityManager } from '@/lib/api/standardization';

// Register custom transformer
CompatibilityManager.registerTransformer('custom-v1-to-v2', {
  canTransform: (from, to) => from === ApiVersion.V1 && to === ApiVersion.V2,
  transform: (data, context) => {
    // Custom transformation logic
    return transformedData;
  },
});
```

## Client-Side Usage

### Version-Aware API Client

```typescript
import { versionedApiClient, ApiVersion } from '@/lib/api/standardization';

// Make V1 request
const v1Response = await versionedApiClient.get('/api/complaints', {
  version: ApiVersion.V1,
});

// Make V2 request with enhanced features
const v2Response = await versionedApiClient.get('/api/complaints', {
  version: ApiVersion.V2,
});

// Paginated request
const paginatedResponse = await versionedApiClient.getPaginated(
  '/api/complaints',
  1, // page
  20, // limit
  { version: ApiVersion.V2 }
);

// Create request
const createResponse = await versionedApiClient.post(
  '/api/complaints',
  {
    title: 'New Complaint',
    tags: ['academic', 'urgent'],
  },
  { version: ApiVersion.V2 }
);
```

### Response Format

All API responses follow a standardized format:

```typescript
interface StandardApiResponse<T> {
  data: T | null;
  error: StandardApiError | null;
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
    timing: TimingInfo;
    pagination?: PaginationMeta;
  };
}
```

## Middleware Integration

### Next.js Middleware Setup

```typescript
// middleware.ts
import { createVersioningMiddlewareStack } from '@/lib/api/standardization';

const versioningMiddleware = createVersioningMiddlewareStack();

export async function middleware(request: NextRequest) {
  // Apply versioning middleware to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return versioningMiddleware(request);
  }

  return NextResponse.next();
}
```

### Response Headers

The system automatically adds version-related headers:

```
X-API-Version: v2
X-Version-Source: header
X-Supported-Versions: v1, v2
X-API-Deprecated: true (for V1)
X-Deprecation-Warning: API version v1 is deprecated...
```

## Feature Support

Check if a version supports specific features:

```typescript
import { ApiVersionManager } from '@/lib/api/standardization';

// Check feature support
const supportsAdvancedSearch = ApiVersionManager.supportsFeature(ApiVersion.V1, 'advanced-search'); // false

const supportsBulkOps = ApiVersionManager.supportsFeature(ApiVersion.V2, 'bulk-operations'); // true
```

## Version Configuration

Each version has a configuration defining its capabilities:

```typescript
const versionConfig = {
  version: ApiVersion.V2,
  isDefault: true,
  isDeprecated: false,
  supportedFeatures: [
    'basic-crud',
    'pagination',
    'filtering',
    'advanced-search',
    'bulk-operations',
    'real-time-updates',
    'enhanced-validation',
  ],
  backwardCompatible: false,
};
```

## Error Handling

### Version Mismatch Errors

```typescript
// Unsupported version request
const errorResponse = {
  data: null,
  error: {
    type: 'validation',
    code: 'UNSUPPORTED_API_VERSION',
    message: "API version 'v3' is not supported. Supported versions: v1, v2",
    details: {
      requestedVersion: 'v3',
      supportedVersions: ['v1', 'v2'],
    },
  },
  meta: {
    /* ... */
  },
};
```

## Migration Guide

### From V1 to V2

1. **Update API calls** to use V2 endpoints or headers
2. **Handle new response format** with enhanced metadata
3. **Update data models** to support new fields:
   - `tags` instead of `category`
   - `created_at_iso` instead of `created_at`
   - `enhanced_metadata` for additional information
   - `status_history` for audit trail

### Gradual Migration

```typescript
// Start with compatibility mode
const response = await versionedApiClient.get('/api/complaints', {
  version: ApiVersion.V2,
  compatibilityMode: true,
});

// Gradually update to full V2 features
const enhancedResponse = await versionedApiClient.get('/api/complaints', {
  version: ApiVersion.V2,
  compatibilityMode: false,
});
```

## Testing

### Version Detection Tests

```typescript
import { ApiVersionManager } from '@/lib/api/standardization';

describe('Version Detection', () => {
  it('should detect version from header', () => {
    const request = new NextRequest('http://localhost/api/complaints', {
      headers: { 'X-API-Version': 'v1' },
    });

    const result = ApiVersionManager.detectVersion(request);
    expect(result.version).toBe(ApiVersion.V1);
  });
});
```

### Compatibility Tests

```typescript
describe('Data Transformation', () => {
  it('should transform V2 to V1 format', () => {
    const v2Data = {
      /* V2 format */
    };
    const v1Data = ApiVersionManager.createCompatibilityResponse(
      v2Data,
      ApiVersion.V2,
      ApiVersion.V1
    );

    expect(v1Data.category).toBeDefined();
    expect(v1Data.tags).toBeUndefined();
  });
});
```

## Best Practices

1. **Always specify version** in API calls for predictable behavior
2. **Use V2 for new features** and enhanced capabilities
3. **Plan migration timeline** for V1 deprecation
4. **Test compatibility** when upgrading between versions
5. **Monitor deprecation warnings** in response headers
6. **Handle version errors** gracefully in client applications

## Troubleshooting

### Common Issues

1. **Version not detected**: Check header format and spelling
2. **Compatibility errors**: Verify data transformation logic
3. **Feature not available**: Check version feature support
4. **Deprecation warnings**: Plan migration to supported version

### Debug Information

Enable debug logging to see version detection and transformation:

```typescript
// Check version detection result
const versionResult = ApiVersionManager.detectVersion(request);
console.log('Version Detection:', versionResult);

// Check feature support
const features = ApiVersionManager.getVersionConfig(version).supportedFeatures;
console.log('Supported Features:', features);
```

## Future Versions

When adding new API versions:

1. **Update ApiVersion enum** with new version
2. **Add version configuration** with supported features
3. **Implement transformation logic** for compatibility
4. **Update endpoint mappings** in version router
5. **Add comprehensive tests** for new version
6. **Update documentation** and migration guides

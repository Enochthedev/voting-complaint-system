/**
 * API Version Management System
 *
 * Handles API versioning through headers, URL paths, and backward compatibility
 */

import { NextRequest, NextResponse } from 'next/server';
import type { StandardApiResponse, ErrorType } from './types';

/**
 * Supported API versions
 */
export enum ApiVersion {
  V1 = 'v1',
  V2 = 'v2',
}

/**
 * Version configuration for each API version
 */
export interface VersionConfig {
  version: ApiVersion;
  isDefault: boolean;
  isDeprecated: boolean;
  deprecationDate?: string;
  sunsetDate?: string;
  supportedFeatures: string[];
  backwardCompatible: boolean;
}

/**
 * Version detection result
 */
export interface VersionDetectionResult {
  version: ApiVersion;
  source: 'header' | 'path' | 'default';
  isValid: boolean;
  config: VersionConfig;
}

/**
 * Version-specific endpoint mapping
 */
export interface VersionedEndpoint {
  path: string;
  versions: {
    [key in ApiVersion]?: {
      handler: string;
      deprecated?: boolean;
      redirectTo?: ApiVersion;
    };
  };
}

/**
 * API Version Manager
 */
export class ApiVersionManager {
  private static readonly VERSION_HEADER = 'X-API-Version';
  private static readonly ACCEPT_VERSION_HEADER = 'Accept-Version';
  private static readonly DEFAULT_VERSION = ApiVersion.V2;

  private static readonly VERSION_CONFIGS: Record<ApiVersion, VersionConfig> = {
    [ApiVersion.V1]: {
      version: ApiVersion.V1,
      isDefault: false,
      isDeprecated: true,
      deprecationDate: '2024-01-01',
      sunsetDate: '2025-01-01',
      supportedFeatures: ['basic-crud', 'pagination', 'filtering'],
      backwardCompatible: true,
    },
    [ApiVersion.V2]: {
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
    },
  };

  private static readonly VERSIONED_ENDPOINTS: VersionedEndpoint[] = [
    {
      path: '/api/complaints',
      versions: {
        [ApiVersion.V1]: { handler: 'complaints-v1', deprecated: true },
        [ApiVersion.V2]: { handler: 'complaints-v2' },
      },
    },
    {
      path: '/api/notifications',
      versions: {
        [ApiVersion.V1]: { handler: 'notifications-v1', deprecated: true },
        [ApiVersion.V2]: { handler: 'notifications-v2' },
      },
    },
    {
      path: '/api/users',
      versions: {
        [ApiVersion.V1]: { handler: 'users-v1', deprecated: true },
        [ApiVersion.V2]: { handler: 'users-v2' },
      },
    },
    {
      path: '/api/analytics',
      versions: {
        [ApiVersion.V2]: { handler: 'analytics-v2' }, // V2 only feature
      },
    },
  ];

  /**
   * Detect API version from request
   */
  static detectVersion(request: NextRequest): VersionDetectionResult {
    // 1. Check version header (X-API-Version)
    const versionHeader = request.headers.get(this.VERSION_HEADER);
    if (versionHeader && this.isValidVersion(versionHeader)) {
      return {
        version: versionHeader as ApiVersion,
        source: 'header',
        isValid: true,
        config: this.VERSION_CONFIGS[versionHeader as ApiVersion],
      };
    }

    // 2. Check Accept-Version header
    const acceptVersionHeader = request.headers.get(this.ACCEPT_VERSION_HEADER);
    if (acceptVersionHeader && this.isValidVersion(acceptVersionHeader)) {
      return {
        version: acceptVersionHeader as ApiVersion,
        source: 'header',
        isValid: true,
        config: this.VERSION_CONFIGS[acceptVersionHeader as ApiVersion],
      };
    }

    // 3. Check URL path for version (e.g., /api/v1/complaints)
    const pathVersion = this.extractVersionFromPath(request.nextUrl.pathname);
    if (pathVersion) {
      return {
        version: pathVersion,
        source: 'path',
        isValid: true,
        config: this.VERSION_CONFIGS[pathVersion],
      };
    }

    // 4. Use default version
    return {
      version: this.DEFAULT_VERSION,
      source: 'default',
      isValid: true,
      config: this.VERSION_CONFIGS[this.DEFAULT_VERSION],
    };
  }

  /**
   * Check if version is valid
   */
  private static isValidVersion(version: string): boolean {
    return Object.values(ApiVersion).includes(version as ApiVersion);
  }

  /**
   * Extract version from URL path
   */
  private static extractVersionFromPath(pathname: string): ApiVersion | null {
    const versionMatch = pathname.match(/\/api\/(v\d+)\//);
    if (versionMatch && this.isValidVersion(versionMatch[1])) {
      return versionMatch[1] as ApiVersion;
    }
    return null;
  }

  /**
   * Get version configuration
   */
  static getVersionConfig(version: ApiVersion): VersionConfig {
    return this.VERSION_CONFIGS[version];
  }

  /**
   * Get all supported versions
   */
  static getSupportedVersions(): ApiVersion[] {
    return Object.values(ApiVersion);
  }

  /**
   * Check if version supports feature
   */
  static supportsFeature(version: ApiVersion, feature: string): boolean {
    const config = this.VERSION_CONFIGS[version];
    return config.supportedFeatures.includes(feature);
  }

  /**
   * Get versioned endpoint configuration
   */
  static getVersionedEndpoint(path: string): VersionedEndpoint | null {
    return (
      this.VERSIONED_ENDPOINTS.find(
        (endpoint) =>
          path.startsWith(endpoint.path) || path.replace(/\/v\d+/, '').startsWith(endpoint.path)
      ) || null
    );
  }

  /**
   * Resolve handler for versioned endpoint
   */
  static resolveHandler(path: string, version: ApiVersion): string | null {
    const endpoint = this.getVersionedEndpoint(path);
    if (!endpoint) return null;

    const versionConfig = endpoint.versions[version];
    if (!versionConfig) return null;

    // Check if version is redirected to another version
    if (versionConfig.redirectTo) {
      const redirectConfig = endpoint.versions[versionConfig.redirectTo];
      return redirectConfig?.handler || null;
    }

    return versionConfig.handler;
  }

  /**
   * Create version-aware response headers
   */
  static createVersionHeaders(version: ApiVersion): Record<string, string> {
    const config = this.VERSION_CONFIGS[version];
    const headers: Record<string, string> = {
      [this.VERSION_HEADER]: version,
      'API-Supported-Versions': this.getSupportedVersions().join(', '),
    };

    if (config.isDeprecated) {
      headers['API-Deprecated'] = 'true';
      if (config.deprecationDate) {
        headers['API-Deprecation-Date'] = config.deprecationDate;
      }
      if (config.sunsetDate) {
        headers['API-Sunset-Date'] = config.sunsetDate;
      }
    }

    return headers;
  }

  /**
   * Create version compatibility response
   */
  static createCompatibilityResponse<T>(
    data: T,
    fromVersion: ApiVersion,
    toVersion: ApiVersion
  ): T {
    // If versions are the same, return as-is
    if (fromVersion === toVersion) {
      return data;
    }

    // Handle backward compatibility transformations
    if (fromVersion === ApiVersion.V2 && toVersion === ApiVersion.V1) {
      return this.transformV2ToV1(data);
    }

    // Handle forward compatibility transformations
    if (fromVersion === ApiVersion.V1 && toVersion === ApiVersion.V2) {
      return this.transformV1ToV2(data);
    }

    return data;
  }

  /**
   * Transform V2 response to V1 format (backward compatibility)
   */
  private static transformV2ToV1<T>(data: T): T {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // Handle array responses
    if (Array.isArray(data)) {
      return data.map((item) => this.transformV2ToV1(item)) as T;
    }

    // Handle object responses
    const transformed = { ...data } as any;

    // Remove V2-only fields
    const v2OnlyFields = [
      'enhanced_metadata',
      'real_time_updates',
      'bulk_operations',
      'advanced_search_score',
    ];

    v2OnlyFields.forEach((field) => {
      delete transformed[field];
    });

    // Transform field names for V1 compatibility
    if (transformed.created_at_iso) {
      transformed.created_at = transformed.created_at_iso;
      delete transformed.created_at_iso;
    }

    if (transformed.updated_at_iso) {
      transformed.updated_at = transformed.updated_at_iso;
      delete transformed.updated_at_iso;
    }

    // Simplify nested objects for V1
    if (transformed.metadata && typeof transformed.metadata === 'object') {
      transformed.metadata = {
        id: transformed.metadata.id,
        type: transformed.metadata.type,
      };
    }

    return transformed as T;
  }

  /**
   * Transform V1 request to V2 format (forward compatibility)
   */
  private static transformV1ToV2<T>(data: T): T {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // Handle array requests
    if (Array.isArray(data)) {
      return data.map((item) => this.transformV1ToV2(item)) as T;
    }

    // Handle object requests
    const transformed = { ...data } as any;

    // Add default V2 fields
    if (!transformed.enhanced_metadata) {
      transformed.enhanced_metadata = {
        version: ApiVersion.V2,
        compatibility_mode: true,
      };
    }

    // Transform field names for V2
    if (transformed.created_at && !transformed.created_at_iso) {
      transformed.created_at_iso = transformed.created_at;
    }

    if (transformed.updated_at && !transformed.updated_at_iso) {
      transformed.updated_at_iso = transformed.updated_at;
    }

    return transformed as T;
  }

  /**
   * Create version mismatch error response
   */
  static createVersionMismatchError(
    requestedVersion: string,
    supportedVersions: ApiVersion[]
  ): StandardApiResponse<null> {
    return {
      data: null,
      error: {
        type: 'validation' as ErrorType,
        code: 'UNSUPPORTED_API_VERSION',
        message: `API version '${requestedVersion}' is not supported. Supported versions: ${supportedVersions.join(', ')}`,
        details: {
          requestedVersion,
          supportedVersions,
        },
        context: {
          requestId: crypto.randomUUID(),
        },
        timestamp: new Date().toISOString(),
      },
      meta: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        version: supportedVersions[0], // Default to first supported version
        timing: {
          duration: 0,
          timestamp: new Date().toISOString(),
        },
      },
    };
  }

  /**
   * Create deprecation warning response
   */
  static createDeprecationWarning(version: ApiVersion): Record<string, string> {
    const config = this.VERSION_CONFIGS[version];
    if (!config.isDeprecated) {
      return {};
    }

    return {
      'API-Deprecation-Warning': `API version ${version} is deprecated. Please migrate to ${this.DEFAULT_VERSION}.`,
      'API-Migration-Guide': `/docs/migration/${version}-to-${this.DEFAULT_VERSION}`,
    };
  }
}

/**
 * Version-aware middleware for API routes
 */
export function withVersioning(
  handler: (request: NextRequest, version: ApiVersion) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Detect version from request
      const versionResult = ApiVersionManager.detectVersion(request);

      // Create response with version-aware handler
      const response = await handler(request, versionResult.version);

      // Add version headers to response
      const versionHeaders = ApiVersionManager.createVersionHeaders(versionResult.version);
      Object.entries(versionHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      // Add deprecation warnings if needed
      const deprecationHeaders = ApiVersionManager.createDeprecationWarning(versionResult.version);
      Object.entries(deprecationHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      console.error('Version management error:', error);

      // Return version mismatch error
      const errorResponse = ApiVersionManager.createVersionMismatchError(
        'unknown',
        ApiVersionManager.getSupportedVersions()
      );

      return NextResponse.json(errorResponse, { status: 400 });
    }
  };
}

/**
 * Create versioned API route handler
 */
export function createVersionedHandler(handlers: {
  [key in ApiVersion]?: (request: NextRequest) => Promise<NextResponse>;
}) {
  return withVersioning(async (request: NextRequest, version: ApiVersion) => {
    const handler = handlers[version];

    if (!handler) {
      // Try to find a compatible handler
      const config = ApiVersionManager.getVersionConfig(version);

      if (config.backwardCompatible && handlers[ApiVersion.V2]) {
        // Use V2 handler with compatibility layer
        const response = await handlers[ApiVersion.V2]!(request);

        // Transform response for backward compatibility
        if (response.headers.get('content-type')?.includes('application/json')) {
          const responseData = await response.json();
          const compatibleData = ApiVersionManager.createCompatibilityResponse(
            responseData,
            ApiVersion.V2,
            version
          );

          return NextResponse.json(compatibleData, {
            status: response.status,
            headers: response.headers,
          });
        }

        return response;
      }

      // No compatible handler found
      const errorResponse = ApiVersionManager.createVersionMismatchError(
        version,
        Object.keys(handlers) as ApiVersion[]
      );

      return NextResponse.json(errorResponse, { status: 400 });
    }

    return handler(request);
  });
}

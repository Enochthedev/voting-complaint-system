/**
 * Version-aware middleware integration
 *
 * Integrates API versioning with Next.js middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiVersionManager, ApiVersion } from './version-manager';
import { initializeDefaultMappings, EndpointMapper } from './version-router';
import {
  initializeCompatibilitySystem,
  createCompatibilityMiddleware,
} from './compatibility-layer';

/**
 * Initialize the versioning system
 */
export function initializeVersioningSystem(): void {
  // Initialize endpoint mappings
  initializeDefaultMappings();

  // Initialize compatibility system
  initializeCompatibilitySystem();
}

/**
 * Version-aware middleware for API routes
 */
export async function versioningMiddleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Skip non-API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip versioning for certain system endpoints
  const skipVersioning = ['/api/csrf-token', '/api/health', '/api/monitoring', '/api/example'];

  if (skipVersioning.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  try {
    // Detect API version
    const versionResult = ApiVersionManager.detectVersion(request);

    // Handle version-specific routing
    const resolution = EndpointMapper.resolveEndpoint(request);

    // Create response with version headers
    const response = NextResponse.next();

    // Add version information to headers
    response.headers.set('X-API-Version', versionResult.version);
    response.headers.set('X-Version-Source', versionResult.source);
    response.headers.set('X-Detected-Version', versionResult.version);
    response.headers.set('X-Original-Path', resolution.originalPath);

    if (resolution.versionedPath) {
      response.headers.set('X-Versioned-Path', resolution.versionedPath);
    }

    // Add supported versions header
    response.headers.set(
      'X-Supported-Versions',
      ApiVersionManager.getSupportedVersions().join(', ')
    );

    // Add deprecation warnings for deprecated versions
    if (versionResult.config.isDeprecated) {
      response.headers.set('X-API-Deprecated', 'true');

      if (versionResult.config.deprecationDate) {
        response.headers.set('X-API-Deprecation-Date', versionResult.config.deprecationDate);
      }

      if (versionResult.config.sunsetDate) {
        response.headers.set('X-API-Sunset-Date', versionResult.config.sunsetDate);
      }

      response.headers.set(
        'X-Deprecation-Warning',
        `API version ${versionResult.version} is deprecated. Please migrate to ${ApiVersionManager.getSupportedVersions().find((v) => !ApiVersionManager.getVersionConfig(v).isDeprecated)}.`
      );
    }

    // Add feature support information
    response.headers.set('X-Supported-Features', versionResult.config.supportedFeatures.join(', '));

    // Handle version-specific redirects if needed
    if (versionResult.source === 'path') {
      // Path-based versioning is already handled by Next.js routing
      return response;
    }

    // For header-based versioning, we might need to rewrite the URL
    if (versionResult.source === 'header' && resolution.versionedPath) {
      // Check if we need to redirect to a version-specific endpoint
      const url = request.nextUrl.clone();

      // Only rewrite if the current path doesn't already include version
      if (!pathname.includes(`/${versionResult.version}/`)) {
        // This would be handled by the route handlers themselves
        // We just add the information to headers for the handlers to use
        response.headers.set('X-Version-Rewrite-Needed', 'true');
        response.headers.set('X-Target-Version-Path', resolution.versionedPath);
      }
    }

    return response;
  } catch (error) {
    console.error('Versioning middleware error:', error);

    // Return error response for invalid versions
    const errorResponse = ApiVersionManager.createVersionMismatchError(
      'unknown',
      ApiVersionManager.getSupportedVersions()
    );

    return NextResponse.json(errorResponse, {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'X-Error-Source': 'versioning-middleware',
      },
    });
  }
}

/**
 * Create version validation middleware
 */
export function createVersionValidationMiddleware(): (
  request: NextRequest
) => Promise<NextResponse> {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { pathname } = request.nextUrl;

    // Skip non-API routes
    if (!pathname.startsWith('/api/')) {
      return NextResponse.next();
    }

    // Validate version header if present
    const versionHeader = request.headers.get('X-API-Version');
    if (versionHeader) {
      const supportedVersions = ApiVersionManager.getSupportedVersions();

      if (!supportedVersions.includes(versionHeader as ApiVersion)) {
        const errorResponse = ApiVersionManager.createVersionMismatchError(
          versionHeader,
          supportedVersions
        );

        return NextResponse.json(errorResponse, {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'X-Error-Source': 'version-validation',
          },
        });
      }
    }

    return NextResponse.next();
  };
}

/**
 * Create version compatibility middleware
 */
export function createVersionCompatibilityMiddleware(): (
  request: NextRequest
) => Promise<NextResponse> {
  return createCompatibilityMiddleware();
}

/**
 * Combine all version-related middleware
 */
export function createVersioningMiddlewareStack(): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Initialize versioning system on first request
    if (!global.__versioningInitialized) {
      initializeVersioningSystem();
      global.__versioningInitialized = true;
    }

    // Apply version validation
    const validationResponse = await createVersionValidationMiddleware()(request);
    if (validationResponse.status !== 200) {
      return validationResponse;
    }

    // Apply version compatibility
    const compatibilityResponse = await createVersionCompatibilityMiddleware()(request);
    if (compatibilityResponse.status !== 200) {
      return compatibilityResponse;
    }

    // Apply main versioning middleware
    return versioningMiddleware(request);
  };
}

// Global flag to track initialization
declare global {
  var __versioningInitialized: boolean | undefined;
}

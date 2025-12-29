/**
 * Version-specific API routing system
 *
 * Handles routing requests to appropriate version handlers based on API version
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiVersionManager, ApiVersion, createVersionedHandler } from './version-manager';
import type { StandardApiResponse } from './types';

/**
 * Route handler function type
 */
export type RouteHandler = (request: NextRequest) => Promise<NextResponse>;

/**
 * Version-specific route configuration
 */
export interface VersionedRoute {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  handlers: Partial<Record<ApiVersion, RouteHandler>>;
  middleware?: RouteHandler[];
  requiresAuth?: boolean;
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
}

/**
 * Route registry for version management
 */
export class VersionRouter {
  private static routes: Map<string, VersionedRoute> = new Map();

  /**
   * Register a versioned route
   */
  static register(route: VersionedRoute): void {
    const key = `${route.method}:${route.path}`;
    this.routes.set(key, route);
  }

  /**
   * Register multiple versioned routes
   */
  static registerRoutes(routes: VersionedRoute[]): void {
    routes.forEach((route) => this.register(route));
  }

  /**
   * Get route configuration
   */
  static getRoute(method: string, path: string): VersionedRoute | null {
    const key = `${method}:${path}`;
    return this.routes.get(key) || null;
  }

  /**
   * Create route handler with version support
   */
  static createHandler(route: VersionedRoute): RouteHandler {
    return createVersionedHandler(route.handlers);
  }

  /**
   * Handle versioned API request
   */
  static async handleRequest(
    request: NextRequest,
    method: string,
    path: string
  ): Promise<NextResponse> {
    // Find matching route
    const route = this.getRoute(method, path);

    if (!route) {
      return NextResponse.json(
        {
          data: null,
          error: {
            type: 'not_found',
            code: 'ROUTE_NOT_FOUND',
            message: `Route ${method} ${path} not found`,
            timestamp: new Date().toISOString(),
          },
          meta: {
            requestId: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            version: ApiVersionManager.detectVersion(request).version,
            timing: {
              duration: 0,
              timestamp: new Date().toISOString(),
            },
          },
        } as StandardApiResponse<null>,
        { status: 404 }
      );
    }

    // Apply middleware if present
    if (route.middleware) {
      for (const middleware of route.middleware) {
        const middlewareResponse = await middleware(request);
        if (middlewareResponse.status !== 200) {
          return middlewareResponse;
        }
      }
    }

    // Create and execute versioned handler
    const handler = this.createHandler(route);
    return handler(request);
  }

  /**
   * Get all registered routes
   */
  static getRoutes(): Map<string, VersionedRoute> {
    return new Map(this.routes);
  }

  /**
   * Clear all routes (useful for testing)
   */
  static clearRoutes(): void {
    this.routes.clear();
  }
}

/**
 * Decorator for creating versioned route handlers
 */
export function versionedRoute(config: {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  requiresAuth?: boolean;
  rateLimit?: { windowMs: number; maxRequests: number };
}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    // Extract version from method name or use default
    const version = propertyKey.includes('V1') ? ApiVersion.V1 : ApiVersion.V2;

    // Register the route
    const existingRoute = VersionRouter.getRoute(config.method, config.path);

    if (existingRoute) {
      // Add handler to existing route
      existingRoute.handlers[version] = originalMethod;
    } else {
      // Create new route
      VersionRouter.register({
        ...config,
        handlers: {
          [version]: originalMethod,
        },
      });
    }

    return descriptor;
  };
}

/**
 * Create backward compatibility middleware
 */
export function createBackwardCompatibilityMiddleware(
  fromVersion: ApiVersion,
  toVersion: ApiVersion
): RouteHandler {
  return async (request: NextRequest): Promise<NextResponse> => {
    const detectedVersion = ApiVersionManager.detectVersion(request);

    if (detectedVersion.version === fromVersion) {
      // Transform request for compatibility
      const url = new URL(request.url);
      url.pathname = url.pathname.replace(`/${fromVersion}/`, `/${toVersion}/`);

      // Add compatibility headers
      const headers = new Headers(request.headers);
      headers.set('X-API-Version', toVersion);
      headers.set('X-Original-Version', fromVersion);
      headers.set('X-Compatibility-Mode', 'true');

      // Create new request with updated version
      const newRequest = new NextRequest(url, {
        method: request.method,
        headers,
        body: request.body,
      });

      return NextResponse.next();
    }

    return NextResponse.next();
  };
}

/**
 * Version-aware endpoint mapping
 */
export class EndpointMapper {
  private static mappings: Map<string, Map<ApiVersion, string>> = new Map();

  /**
   * Register endpoint mapping
   */
  static register(basePath: string, versionMappings: Partial<Record<ApiVersion, string>>): void {
    const versionMap = new Map<ApiVersion, string>();

    Object.entries(versionMappings).forEach(([version, path]) => {
      versionMap.set(version as ApiVersion, path);
    });

    this.mappings.set(basePath, versionMap);
  }

  /**
   * Get versioned endpoint path
   */
  static getVersionedPath(basePath: string, version: ApiVersion): string | null {
    const versionMap = this.mappings.get(basePath);
    return versionMap?.get(version) || null;
  }

  /**
   * Resolve endpoint for request
   */
  static resolveEndpoint(request: NextRequest): {
    originalPath: string;
    versionedPath: string | null;
    version: ApiVersion;
  } {
    const { pathname } = request.nextUrl;
    const versionResult = ApiVersionManager.detectVersion(request);

    // Remove version prefix from path if present
    const cleanPath = pathname.replace(/\/api\/v\d+/, '/api');

    // Find matching base path
    for (const [basePath] of this.mappings) {
      if (cleanPath.startsWith(basePath)) {
        const versionedPath = this.getVersionedPath(basePath, versionResult.version);
        return {
          originalPath: cleanPath,
          versionedPath,
          version: versionResult.version,
        };
      }
    }

    return {
      originalPath: cleanPath,
      versionedPath: null,
      version: versionResult.version,
    };
  }

  /**
   * Get all mappings
   */
  static getMappings(): Map<string, Map<ApiVersion, string>> {
    return new Map(this.mappings);
  }

  /**
   * Clear all mappings
   */
  static clearMappings(): void {
    this.mappings.clear();
  }
}

/**
 * Initialize default endpoint mappings
 */
export function initializeDefaultMappings(): void {
  // Complaints API mappings
  EndpointMapper.register('/api/complaints', {
    [ApiVersion.V1]: '/api/v1/complaints',
    [ApiVersion.V2]: '/api/v2/complaints',
  });

  // Notifications API mappings
  EndpointMapper.register('/api/notifications', {
    [ApiVersion.V1]: '/api/v1/notifications',
    [ApiVersion.V2]: '/api/v2/notifications',
  });

  // Users API mappings
  EndpointMapper.register('/api/users', {
    [ApiVersion.V1]: '/api/v1/users',
    [ApiVersion.V2]: '/api/v2/users',
  });

  // Analytics API mappings (V2 only)
  EndpointMapper.register('/api/analytics', {
    [ApiVersion.V2]: '/api/v2/analytics',
  });

  // Votes API mappings
  EndpointMapper.register('/api/votes', {
    [ApiVersion.V1]: '/api/v1/votes',
    [ApiVersion.V2]: '/api/v2/votes',
  });

  // Announcements API mappings
  EndpointMapper.register('/api/announcements', {
    [ApiVersion.V1]: '/api/v1/announcements',
    [ApiVersion.V2]: '/api/v2/announcements',
  });
}

/**
 * Create version-aware API middleware
 */
export function createVersionAwareMiddleware(): RouteHandler {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { pathname } = request.nextUrl;

    // Skip non-API routes
    if (!pathname.startsWith('/api/')) {
      return NextResponse.next();
    }

    // Skip versioning for certain endpoints
    const skipVersioning = ['/api/csrf-token', '/api/health', '/api/monitoring'];

    if (skipVersioning.some((path) => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    // Resolve endpoint mapping
    const resolution = EndpointMapper.resolveEndpoint(request);

    // Add version information to request headers
    const response = NextResponse.next();
    response.headers.set('X-Detected-Version', resolution.version);
    response.headers.set('X-Original-Path', resolution.originalPath);

    if (resolution.versionedPath) {
      response.headers.set('X-Versioned-Path', resolution.versionedPath);
    }

    return response;
  };
}

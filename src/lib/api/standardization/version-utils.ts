/**
 * Version utilities for client-side API interactions
 *
 * Provides utilities for working with versioned APIs from client code
 */

import { ApiVersion } from './version-manager';
import type { StandardApiResponse, PaginatedApiResponse } from './types';

/**
 * API client configuration for versioning
 */
export interface VersionedApiClientConfig {
  baseUrl?: string;
  defaultVersion?: ApiVersion;
  enableVersionHeaders?: boolean;
  enableCompatibilityMode?: boolean;
}

/**
 * Version-aware fetch options
 */
export interface VersionedFetchOptions extends RequestInit {
  version?: ApiVersion;
  compatibilityMode?: boolean;
  skipVersionHeaders?: boolean;
}

/**
 * Version-aware API client
 */
export class VersionedApiClient {
  private config: Required<VersionedApiClientConfig>;

  constructor(config: VersionedApiClientConfig = {}) {
    this.config = {
      baseUrl: '',
      defaultVersion: ApiVersion.V2,
      enableVersionHeaders: true,
      enableCompatibilityMode: true,
      ...config,
    };
  }

  /**
   * Make a versioned API request
   */
  async fetch<T = any>(
    url: string,
    options: VersionedFetchOptions = {}
  ): Promise<StandardApiResponse<T>> {
    const {
      version = this.config.defaultVersion,
      compatibilityMode = this.config.enableCompatibilityMode,
      skipVersionHeaders = false,
      ...fetchOptions
    } = options;

    // Prepare headers
    const headers = new Headers(fetchOptions.headers);

    // Add version headers if enabled
    if (this.config.enableVersionHeaders && !skipVersionHeaders) {
      headers.set('X-API-Version', version);
      headers.set('Accept-Version', version);

      if (compatibilityMode) {
        headers.set('X-Compatibility-Mode', 'true');
      }
    }

    // Add standard headers
    if (!headers.has('Content-Type') && fetchOptions.body) {
      headers.set('Content-Type', 'application/json');
    }

    headers.set('Accept', 'application/json');

    try {
      // Make the request
      const response = await fetch(`${this.config.baseUrl}${url}`, {
        ...fetchOptions,
        headers,
      });

      // Parse response
      const data = await response.json();

      // Check if response is in standard format
      if (this.isStandardResponse(data)) {
        return data as StandardApiResponse<T>;
      }

      // Wrap non-standard response
      return this.wrapResponse<T>(data, response, version);
    } catch (error) {
      return this.createErrorResponse<T>(error, version);
    }
  }

  /**
   * Make a GET request
   */
  async get<T = any>(
    url: string,
    options: Omit<VersionedFetchOptions, 'method' | 'body'> = {}
  ): Promise<StandardApiResponse<T>> {
    return this.fetch<T>(url, { ...options, method: 'GET' });
  }

  /**
   * Make a POST request
   */
  async post<T = any>(
    url: string,
    body?: any,
    options: Omit<VersionedFetchOptions, 'method' | 'body'> = {}
  ): Promise<StandardApiResponse<T>> {
    return this.fetch<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(
    url: string,
    body?: any,
    options: Omit<VersionedFetchOptions, 'method' | 'body'> = {}
  ): Promise<StandardApiResponse<T>> {
    return this.fetch<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Make a PATCH request
   */
  async patch<T = any>(
    url: string,
    body?: any,
    options: Omit<VersionedFetchOptions, 'method' | 'body'> = {}
  ): Promise<StandardApiResponse<T>> {
    return this.fetch<T>(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(
    url: string,
    options: Omit<VersionedFetchOptions, 'method' | 'body'> = {}
  ): Promise<StandardApiResponse<T>> {
    return this.fetch<T>(url, { ...options, method: 'DELETE' });
  }

  /**
   * Make a paginated request
   */
  async getPaginated<T = any>(
    url: string,
    page: number = 1,
    limit: number = 20,
    options: Omit<VersionedFetchOptions, 'method' | 'body'> = {}
  ): Promise<PaginatedApiResponse<T>> {
    const searchParams = new URLSearchParams();
    searchParams.set('page', page.toString());
    searchParams.set('limit', limit.toString());

    const separator = url.includes('?') ? '&' : '?';
    const paginatedUrl = `${url}${separator}${searchParams.toString()}`;

    return this.get<T[]>(paginatedUrl, options) as Promise<PaginatedApiResponse<T>>;
  }

  /**
   * Check if response is in standard format
   */
  private isStandardResponse(data: any): boolean {
    return (
      data && typeof data === 'object' && ('data' in data || 'error' in data) && 'meta' in data
    );
  }

  /**
   * Wrap non-standard response in standard format
   */
  private wrapResponse<T>(
    data: any,
    response: Response,
    version: ApiVersion
  ): StandardApiResponse<T> {
    const responseVersion = response.headers.get('X-API-Version') || version;

    return {
      data: response.ok ? data : null,
      error: response.ok
        ? null
        : {
            type: 'server_error',
            code: `HTTP_${response.status}`,
            message: response.statusText || 'Request failed',
            timestamp: new Date().toISOString(),
          },
      meta: {
        requestId: response.headers.get('X-Request-ID') || crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        version: responseVersion as ApiVersion,
        timing: {
          duration: 0,
          timestamp: new Date().toISOString(),
        },
      },
    };
  }

  /**
   * Create error response
   */
  private createErrorResponse<T>(error: any, version: ApiVersion): StandardApiResponse<T> {
    return {
      data: null,
      error: {
        type: 'network_error',
        code: 'NETWORK_ERROR',
        message: error.message || 'Network request failed',
        details: {
          originalError: error.name,
        },
        timestamp: new Date().toISOString(),
      },
      meta: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        version,
        timing: {
          duration: 0,
          timestamp: new Date().toISOString(),
        },
      },
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<VersionedApiClientConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): VersionedApiClientConfig {
    return { ...this.config };
  }
}

/**
 * Version detection utilities
 */
export class VersionDetectionUtils {
  /**
   * Detect version from response headers
   */
  static detectVersionFromResponse(response: Response): {
    version: ApiVersion;
    isDeprecated: boolean;
    supportedVersions: ApiVersion[];
  } {
    const version = (response.headers.get('X-API-Version') as ApiVersion) || ApiVersion.V2;
    const isDeprecated = response.headers.get('X-API-Deprecated') === 'true';
    const supportedVersionsHeader = response.headers.get('X-Supported-Versions') || '';
    const supportedVersions = supportedVersionsHeader
      .split(',')
      .map((v) => v.trim())
      .filter((v) => Object.values(ApiVersion).includes(v as ApiVersion)) as ApiVersion[];

    return {
      version,
      isDeprecated,
      supportedVersions: supportedVersions.length > 0 ? supportedVersions : [ApiVersion.V2],
    };
  }

  /**
   * Check if version is supported
   */
  static isVersionSupported(version: ApiVersion, supportedVersions: ApiVersion[]): boolean {
    return supportedVersions.includes(version);
  }

  /**
   * Get latest supported version
   */
  static getLatestVersion(supportedVersions: ApiVersion[]): ApiVersion {
    // Assuming V2 is newer than V1
    if (supportedVersions.includes(ApiVersion.V2)) {
      return ApiVersion.V2;
    }
    return supportedVersions[0] || ApiVersion.V2;
  }

  /**
   * Parse deprecation information from headers
   */
  static parseDeprecationInfo(response: Response): {
    isDeprecated: boolean;
    deprecationDate?: string;
    sunsetDate?: string;
    migrationGuide?: string;
  } {
    return {
      isDeprecated: response.headers.get('X-API-Deprecated') === 'true',
      deprecationDate: response.headers.get('X-API-Deprecation-Date') || undefined,
      sunsetDate: response.headers.get('X-API-Sunset-Date') || undefined,
      migrationGuide: response.headers.get('X-Migration-Guide') || undefined,
    };
  }
}

/**
 * Create default versioned API client
 */
export function createVersionedApiClient(config?: VersionedApiClientConfig): VersionedApiClient {
  return new VersionedApiClient(config);
}

/**
 * Default versioned API client instance
 */
export const versionedApiClient = createVersionedApiClient({
  baseUrl: typeof window !== 'undefined' ? window.location.origin : '',
  defaultVersion: ApiVersion.V2,
  enableVersionHeaders: true,
  enableCompatibilityMode: true,
});

/**
 * Version-aware fetch wrapper
 */
export async function versionedFetch<T = any>(
  url: string,
  options: VersionedFetchOptions = {}
): Promise<StandardApiResponse<T>> {
  return versionedApiClient.fetch<T>(url, options);
}

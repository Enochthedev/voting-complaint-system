/**
 * Migration wrapper for transitioning existing API calls to standardized format
 *
 * This wrapper provides backward compatibility while gradually migrating
 * to the new standardized API response format.
 */

import { StandardApiResponse, ErrorType, StandardApiError, ResponseMeta } from './types';
import { ApiResponseWrapper } from './response-wrapper';
import { withMonitoring } from './monitoring-wrapper';
import { StandardizedErrorHandler } from './error-handler';

/**
 * Migration wrapper that converts legacy API responses to standardized format
 */
export class MigrationWrapper {
  private responseWrapper: ApiResponseWrapper;

  constructor(requestId?: string, version: string = 'v1') {
    this.responseWrapper = new ApiResponseWrapper(requestId, version);
  }

  /**
   * Wrap legacy API function to return standardized response
   */
  wrapLegacyApi<T, Args extends any[]>(
    legacyFn: (...args: Args) => Promise<T>,
    operationName: string
  ) {
    return withMonitoring(
      async (...args: Args): Promise<StandardApiResponse<T>> => {
        try {
          const data = await legacyFn(...args);
          return this.responseWrapper.success(data);
        } catch (error) {
          return this.handleLegacyError(error);
        }
      },
      {
        operation: operationName,
        category: 'migration',
        tags: { legacy: true },
      }
    );
  }

  /**
   * Convert legacy error to standardized error format
   */
  private handleLegacyError(error: any): StandardApiResponse<null> {
    const standardError = StandardizedErrorHandler.processError(error, {
      requestId: this.responseWrapper.getRequestId()
    });

    return {
      data: null,
      error: standardError,
      meta: {
        requestId: this.responseWrapper.getRequestId(),
        timestamp: new Date().toISOString(),
        version: 'v1',
        timing: {
          duration: 0,
          timestamp: new Date().toISOString()
        }
      }
    };
  }
    });
  }

  /**
   * Wrap Supabase response to standardized format
   */
  wrapSupabaseResponse<T>(supabaseResponse: {
    data: T | null;
    error: any;
  }): StandardApiResponse<T | null> {
    if (supabaseResponse.error) {
      return this.handleSupabaseError(supabaseResponse.error);
    }

    return this.responseWrapper.success(supabaseResponse.data);
  }

  /**
   * Handle Supabase-specific errors
   */
  private handleSupabaseError(error: any): StandardApiResponse<null> {
    const standardError = StandardizedErrorHandler.processError(error, {
      requestId: this.responseWrapper.getRequestId()
    });

    return {
      data: null,
      error: standardError,
      meta: {
        requestId: this.responseWrapper.getRequestId(),
        timestamp: new Date().toISOString(),
        version: 'v1',
        timing: {
          duration: 0,
          timestamp: new Date().toISOString()
        }
      }
    };
  }

  /**
   * Create a standardized paginated response from legacy data
   */
  createPaginatedResponse<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      baseUrl: string;
      queryParams?: Record<string, string>;
    }
  ) {
    return this.responseWrapper.paginated(data, pagination);
  }
}

/**
 * Factory function to create migration wrapper instances
 */
export function createMigrationWrapper(requestId?: string, version?: string) {
  return new MigrationWrapper(requestId, version);
}

/**
 * Utility function to wrap existing API functions for gradual migration
 */
export function migrateApiFunction<T, Args extends any[]>(
  legacyFn: (...args: Args) => Promise<T>,
  operationName: string,
  requestId?: string
) {
  const wrapper = createMigrationWrapper(requestId);
  return wrapper.wrapLegacyApi(legacyFn, operationName);
}

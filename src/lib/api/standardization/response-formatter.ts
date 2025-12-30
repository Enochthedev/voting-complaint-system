/**
 * Response formatting utilities for API standardization
 */

import type {
  ApiResponse,
  ApiError,
  ResponseMetadata,
  PaginationInfo,
  StandardApiResponse,
  StandardApiError,
  ResponseMeta,
  PaginatedApiResponse,
  ErrorType,
} from './types';
import { ApiResponseWrapper } from './response-wrapper';

/**
 * Standard response formatter (legacy - use ApiResponseWrapper for new code)
 */
export class ResponseFormatter {
  /**
   * Create successful response
   */
  success<T>(data: T, metadata?: ResponseMetadata): ApiResponse<T> {
    return {
      data,
      error: null,
      metadata,
    };
  }

  /**
   * Create error response
   */
  error<T = null>(code: string, message: string, details?: Record<string, any>): ApiResponse<T> {
    const error: ApiError = {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    };

    return {
      data: null as T,
      error,
    };
  }

  /**
   * Create paginated response
   */
  paginated<T>(
    data: T[],
    pagination: PaginationInfo,
    metadata?: Omit<ResponseMetadata, 'pagination'>
  ): ApiResponse<T[]> {
    return {
      data,
      error: null,
      metadata: {
        ...metadata,
        pagination,
      },
    };
  }

  /**
   * Calculate pagination info
   */
  calculatePagination(total: number, page: number, limit: number): PaginationInfo {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Format Supabase response to standard format
   */
  fromSupabase<T>(
    supabaseResponse: { data: T | null; error: any },
    metadata?: ResponseMetadata
  ): ApiResponse<T | null> {
    if (supabaseResponse.error) {
      return this.error<T | null>(
        supabaseResponse.error.code || 'SUPABASE_ERROR',
        supabaseResponse.error.message || 'An error occurred',
        supabaseResponse.error
      );
    }

    return this.success(supabaseResponse.data, metadata);
  }

  /**
   * Transform response data
   */
  transform<T, U>(response: ApiResponse<T>, transformer: (data: T) => U): ApiResponse<U> {
    if (response.error) {
      return {
        data: null as U,
        error: response.error,
        metadata: response.metadata,
      };
    }

    return {
      ...response,
      data: response.data ? transformer(response.data) : (null as U),
    };
  }
}

/**
 * Enhanced standardized response formatter
 */
export class StandardResponseFormatter {
  private wrapper: ApiResponseWrapper;

  constructor(requestId?: string, version?: string) {
    this.wrapper = new ApiResponseWrapper(requestId, version);
  }

  /**
   * Create successful standardized response
   */
  success<T>(data: T, status: number = 200, additionalMeta?: Partial<ResponseMeta>) {
    return this.wrapper.success(data, status, additionalMeta);
  }

  /**
   * Create error standardized response
   */
  error(
    type: ErrorType,
    code: string,
    message: string,
    status: number = 400,
    details?: any,
    context?: any
  ) {
    return this.wrapper.error(type, code, message, status, details, context);
  }

  /**
   * Create paginated standardized response
   */
  paginated<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      baseUrl: string;
      queryParams?: Record<string, string>;
    },
    status: number = 200
  ) {
    return this.wrapper.paginated(data, pagination, status);
  }

  /**
   * Create validation error response
   */
  validationError(fieldErrors: any[], message?: string, context?: any) {
    return this.wrapper.validationError(fieldErrors, message, context);
  }

  /**
   * Get request ID
   */
  getRequestId(): string {
    return this.wrapper.getRequestId();
  }
}

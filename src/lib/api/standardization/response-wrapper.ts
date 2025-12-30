/**
 * Standardized API Response Wrapper System
 *
 * Provides utilities for creating consistent API responses with:
 * - Request IDs and timing metadata
 * - API versioning support
 * - Standardized error handling
 * - Pagination support
 */

import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import type {
  StandardApiResponse,
  StandardApiError,
  ResponseMeta,
  PaginatedApiResponse,
  PaginationMeta,
  PaginationLinks,
  ErrorDetails,
  ErrorContext,
  FieldError,
  TimingInfo,
} from './types';
import { ErrorType } from './types';
import { ErrorNormalizer } from './error-normalizer';
import { PaginationHelper } from './pagination-helper';

/**
 * API Version configuration
 */
export const API_VERSION = '1.0.0';

/**
 * Response wrapper class for creating standardized API responses
 */
export class ApiResponseWrapper {
  private startTime: number;
  private requestId: string;
  private version: string;

  constructor(requestId?: string, version?: string) {
    this.startTime = Date.now();
    this.requestId = requestId || uuidv4();
    this.version = version || API_VERSION;
  }

  /**
   * Create response metadata
   */
  private createMeta(additionalMeta?: Partial<ResponseMeta>): ResponseMeta {
    const timing: TimingInfo = {
      duration: Date.now() - this.startTime,
      timestamp: new Date().toISOString(),
    };

    return {
      requestId: this.requestId,
      timestamp: new Date().toISOString(),
      version: this.version,
      timing,
      ...additionalMeta,
    };
  }

  /**
   * Create successful response
   */
  success<T>(
    data: T,
    status: number = 200,
    additionalMeta?: Partial<ResponseMeta>
  ): NextResponse<StandardApiResponse<T>> {
    const response: StandardApiResponse<T> = {
      data,
      error: null,
      meta: this.createMeta(additionalMeta),
    };

    return NextResponse.json(response, {
      status,
      headers: this.getResponseHeaders(),
    });
  }

  /**
   * Create error response
   */
  error(
    type: ErrorType,
    code: string,
    message: string,
    status: number = 400,
    details?: ErrorDetails,
    context?: Partial<ErrorContext>
  ): NextResponse<StandardApiResponse<null>> {
    const error: StandardApiError = {
      type,
      code,
      message,
      details,
      context: context
        ? {
            requestId: this.requestId,
            ...context,
          }
        : undefined,
      timestamp: new Date().toISOString(),
    };

    const response: StandardApiResponse<null> = {
      data: null,
      error,
      meta: this.createMeta(),
    };

    return NextResponse.json(response, {
      status,
      headers: this.getResponseHeaders(),
    });
  }

  /**
   * Create validation error response
   */
  validationError(
    fieldErrors: FieldError[],
    message: string = 'Validation failed',
    context?: Partial<ErrorContext>
  ): NextResponse<StandardApiResponse<null>> {
    const details: ErrorDetails = {
      fields: fieldErrors,
    };

    return this.error(ErrorType.VALIDATION, 'VALIDATION_ERROR', message, 400, details, context);
  }

  /**
   * Create normalized error response from any error type
   */
  normalizedError(
    error: any,
    status?: number,
    context?: Partial<ErrorContext>
  ): NextResponse<StandardApiResponse<null>> {
    const normalizedError = ErrorNormalizer.normalize(error, {
      requestId: this.requestId,
      ...context,
    });

    const response: StandardApiResponse<null> = {
      data: null,
      error: normalizedError,
      meta: this.createMeta(),
    };

    // Determine status code based on error type if not provided
    const errorStatus = status || this.getStatusFromErrorType(normalizedError.type);

    return NextResponse.json(response, {
      status: errorStatus,
      headers: this.getResponseHeaders(),
    });
  }

  /**
   * Create paginated response
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
  ): NextResponse<PaginatedApiResponse<T>> {
    const paginationMeta = PaginationHelper.calculatePagination(pagination);

    const response: PaginatedApiResponse<T> = {
      data,
      error: null,
      meta: {
        ...this.createMeta(),
        pagination: paginationMeta,
      },
    };

    return NextResponse.json(response, {
      status,
      headers: this.getResponseHeaders(),
    });
  }

  /**
   * Create plain successful response (without NextResponse wrapper)
   */
  createSuccessResponse<T>(
    data: T,
    additionalMeta?: Partial<ResponseMeta>
  ): StandardApiResponse<T> {
    return {
      data,
      error: null,
      meta: this.createMeta(additionalMeta),
    };
  }

  /**
   * Create plain error response (without NextResponse wrapper)
   */
  createErrorResponse(
    type: ErrorType,
    code: string,
    message: string,
    details?: ErrorDetails,
    context?: Partial<ErrorContext>
  ): StandardApiResponse<null> {
    const error: StandardApiError = {
      type,
      code,
      message,
      details,
      context: context
        ? {
            requestId: this.requestId,
            ...context,
          }
        : undefined,
      timestamp: new Date().toISOString(),
    };

    return {
      data: null,
      error,
      meta: this.createMeta(),
    };
  }

  /**
   * Create plain paginated response (without NextResponse wrapper)
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
  ): PaginatedApiResponse<T> {
    const paginationMeta = PaginationHelper.calculatePagination(pagination);

    return {
      data,
      error: null,
      meta: {
        ...this.createMeta(),
        pagination: paginationMeta,
      },
    };
  }

  /**
   * Get standard response headers including API version
   */
  private getResponseHeaders(): Record<string, string> {
    return {
      'X-API-Version': this.version,
      'X-Request-ID': this.requestId,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    };
  }

  /**
   * Get HTTP status code from error type
   */
  private getStatusFromErrorType(errorType: ErrorType): number {
    const statusMap: Record<ErrorType, number> = {
      [ErrorType.VALIDATION]: 400,
      [ErrorType.AUTHENTICATION]: 401,
      [ErrorType.AUTHORIZATION]: 403,
      [ErrorType.NOT_FOUND]: 404,
      [ErrorType.CONFLICT]: 409,
      [ErrorType.RATE_LIMIT]: 429,
      [ErrorType.SERVER_ERROR]: 500,
      [ErrorType.NETWORK_ERROR]: 502,
      [ErrorType.TIMEOUT]: 504,
      [ErrorType.UNKNOWN]: 500,
    };

    return statusMap[errorType] || 500;
  }

  /**
   * Get request ID for logging and tracing
   */
  getRequestId(): string {
    return this.requestId;
  }

  /**
   * Get API version
   */
  getVersion(): string {
    return this.version;
  }
}

/**
 * Utility function to create a new response wrapper
 */
export function createApiResponse(requestId?: string, version?: string): ApiResponseWrapper {
  return new ApiResponseWrapper(requestId, version);
}

/**
 * Utility function to extract request ID from headers
 */
export function extractRequestId(headers: Headers): string {
  return headers.get('X-Request-ID') || headers.get('x-request-id') || uuidv4();
}

/**
 * Utility function to sanitize parameters for error context
 */
export function sanitizeParameters(params: Record<string, any>): Record<string, any> {
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
  const sanitized: Record<string, any> = {};

  Object.entries(params).forEach(([key, value]) => {
    const isSensitive = sensitiveKeys.some((sensitiveKey) =>
      key.toLowerCase().includes(sensitiveKey)
    );

    sanitized[key] = isSensitive ? '[REDACTED]' : value;
  });

  return sanitized;
}

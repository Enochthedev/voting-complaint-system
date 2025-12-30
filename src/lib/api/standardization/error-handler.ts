/**
 * Standardized Error Handler
 *
 * Provides consistent error handling across the application with
 * proper error classification, logging, and user-friendly messages.
 */

import { StandardApiError, ErrorType, ErrorDetails, ErrorContext } from './types';
import { ValidationError, DatabaseError } from '@/lib/validation';
import { TimeoutError } from '@/lib/timeout';

/**
 * Error handler class for standardizing error processing
 */
export class StandardizedErrorHandler {
  /**
   * Process and classify errors into standardized format
   */
  static processError(error: any, context?: Partial<ErrorContext>): StandardApiError {
    const timestamp = new Date().toISOString();
    const requestId = context?.requestId || this.generateRequestId();

    // Handle known error types
    if (error instanceof ValidationError) {
      return this.createValidationError(error, requestId, timestamp, context);
    }

    if (error instanceof DatabaseError) {
      return this.createDatabaseError(error, requestId, timestamp, context);
    }

    if (error instanceof TimeoutError) {
      return this.createTimeoutError(error, requestId, timestamp, context);
    }

    // Handle Supabase errors
    if (error?.code && typeof error.code === 'string') {
      return this.createSupabaseError(error, requestId, timestamp, context);
    }

    // Handle authentication/authorization errors
    if (this.isAuthError(error)) {
      return this.createAuthError(error, requestId, timestamp, context);
    }

    // Handle network errors
    if (this.isNetworkError(error)) {
      return this.createNetworkError(error, requestId, timestamp, context);
    }

    // Handle rate limit errors
    if (this.isRateLimitError(error)) {
      return this.createRateLimitError(error, requestId, timestamp, context);
    }

    // Default to unknown error
    return this.createUnknownError(error, requestId, timestamp, context);
  }

  /**
   * Create validation error
   */
  private static createValidationError(
    error: ValidationError,
    requestId: string,
    timestamp: string,
    context?: Partial<ErrorContext>
  ): StandardApiError {
    const fieldErrors =
      (error as any).errors?.map((err: any) => ({
        field: err.path?.join('.') || 'unknown',
        code: err.code || 'VALIDATION_ERROR',
        message: err.message,
        value: err.received,
      })) || [];

    return {
      type: ErrorType.VALIDATION,
      code: 'VALIDATION_FAILED',
      message: (error as any).getUserMessage?.() || 'Validation failed',
      details: {
        fields: fieldErrors,
        context: (error as any).context,
        originalError: error.name,
      },
      context: {
        requestId,
        ...context,
      },
      timestamp,
    };
  }

  /**
   * Create database error
   */
  private static createDatabaseError(
    error: DatabaseError,
    requestId: string,
    timestamp: string,
    context?: Partial<ErrorContext>
  ): StandardApiError {
    const dbError = error as any;
    return {
      type: ErrorType.SERVER_ERROR,
      code: dbError.code || 'DATABASE_ERROR',
      message: error.message || 'Database operation failed',
      details: {
        context: {
          details: dbError.details,
          hint: dbError.hint,
          table: dbError.table,
        },
        originalError: error.name,
      },
      context: {
        requestId,
        ...context,
      },
      timestamp,
    };
  }

  /**
   * Create timeout error
   */
  private static createTimeoutError(
    error: TimeoutError,
    requestId: string,
    timestamp: string,
    context?: Partial<ErrorContext>
  ): StandardApiError {
    const timeoutError = error as any;
    return {
      type: ErrorType.TIMEOUT,
      code: 'REQUEST_TIMEOUT',
      message: 'Request timed out',
      details: {
        context: {
          timeout: timeoutError.timeoutMs || timeoutError.timeout,
          operation: timeoutError.operation,
        },
        originalError: error.name,
      },
      context: {
        requestId,
        ...context,
      },
      timestamp,
    };
  }

  /**
   * Create Supabase error
   */
  private static createSupabaseError(
    error: any,
    requestId: string,
    timestamp: string,
    context?: Partial<ErrorContext>
  ): StandardApiError {
    let errorType = ErrorType.SERVER_ERROR;
    let code = error.code;
    let message = error.message || 'Database operation failed';

    // Map Supabase error codes
    switch (error.code) {
      case '23505': // Unique constraint violation
        errorType = ErrorType.CONFLICT;
        code = 'DUPLICATE_RESOURCE';
        message = 'Resource already exists';
        break;
      case '23503': // Foreign key violation
        errorType = ErrorType.VALIDATION;
        code = 'INVALID_REFERENCE';
        message = 'Invalid reference to related resource';
        break;
      case '42501': // Insufficient privilege
        errorType = ErrorType.AUTHORIZATION;
        code = 'INSUFFICIENT_PRIVILEGES';
        message = 'Insufficient privileges for this operation';
        break;
      case 'PGRST116': // No rows found
        errorType = ErrorType.NOT_FOUND;
        code = 'RESOURCE_NOT_FOUND';
        message = 'Resource not found';
        break;
      case 'PGRST301': // Row level security violation
        errorType = ErrorType.AUTHORIZATION;
        code = 'RLS_VIOLATION';
        message = 'Access denied by security policy';
        break;
    }

    return {
      type: errorType,
      code,
      message,
      details: {
        context: {
          supabaseCode: error.code,
          details: error.details,
          hint: error.hint,
        },
        originalError: 'SupabaseError',
      },
      context: {
        requestId,
        ...context,
      },
      timestamp,
    };
  }

  /**
   * Create authentication/authorization error
   */
  private static createAuthError(
    error: any,
    requestId: string,
    timestamp: string,
    context?: Partial<ErrorContext>
  ): StandardApiError {
    const isAuthenticationError =
      error.message?.toLowerCase().includes('not authenticated') ||
      error.message?.toLowerCase().includes('invalid token') ||
      error.message?.toLowerCase().includes('expired');

    return {
      type: isAuthenticationError ? ErrorType.AUTHENTICATION : ErrorType.AUTHORIZATION,
      code: isAuthenticationError ? 'AUTHENTICATION_REQUIRED' : 'AUTHORIZATION_FAILED',
      message: isAuthenticationError ? 'Authentication required' : 'Insufficient permissions',
      details: {
        originalError: error.name || 'AuthError',
      },
      context: {
        requestId,
        ...context,
      },
      timestamp,
    };
  }

  /**
   * Create network error
   */
  private static createNetworkError(
    error: any,
    requestId: string,
    timestamp: string,
    context?: Partial<ErrorContext>
  ): StandardApiError {
    return {
      type: ErrorType.NETWORK_ERROR,
      code: 'NETWORK_ERROR',
      message: 'Network connection failed',
      details: {
        context: {
          status: error.status,
          statusText: error.statusText,
        },
        originalError: error.name || 'NetworkError',
      },
      context: {
        requestId,
        ...context,
      },
      timestamp,
    };
  }

  /**
   * Create rate limit error
   */
  private static createRateLimitError(
    error: any,
    requestId: string,
    timestamp: string,
    context?: Partial<ErrorContext>
  ): StandardApiError {
    return {
      type: ErrorType.RATE_LIMIT,
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Rate limit exceeded. Please try again later.',
      details: {
        context: {
          retryAfter: error.retryAfter,
          limit: error.limit,
        },
        originalError: error.name || 'RateLimitError',
      },
      context: {
        requestId,
        ...context,
      },
      timestamp,
    };
  }

  /**
   * Create unknown error
   */
  private static createUnknownError(
    error: any,
    requestId: string,
    timestamp: string,
    context?: Partial<ErrorContext>
  ): StandardApiError {
    return {
      type: ErrorType.UNKNOWN,
      code: 'UNKNOWN_ERROR',
      message: error?.message || 'An unexpected error occurred',
      details: {
        trace: error?.stack?.split('\n').slice(0, 3).join('\n'),
        originalError: error?.name || 'UnknownError',
      },
      context: {
        requestId,
        ...context,
      },
      timestamp,
    };
  }

  /**
   * Check if error is authentication/authorization related
   */
  private static isAuthError(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    return (
      message.includes('not authenticated') ||
      message.includes('not authorized') ||
      message.includes('invalid token') ||
      message.includes('expired') ||
      message.includes('unauthorized') ||
      message.includes('forbidden')
    );
  }

  /**
   * Check if error is network related
   */
  private static isNetworkError(error: any): boolean {
    return (
      error?.name === 'NetworkError' ||
      error?.code === 'NETWORK_ERROR' ||
      (typeof error?.status === 'number' && error.status >= 500)
    );
  }

  /**
   * Check if error is rate limit related
   */
  private static isRateLimitError(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    return (
      message.includes('rate limit') ||
      message.includes('too many requests') ||
      error?.status === 429
    );
  }

  /**
   * Generate unique request ID
   */
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: StandardApiError): string {
    switch (error.type) {
      case ErrorType.VALIDATION:
        return error.details?.fields?.length
          ? `Please check: ${error.details.fields.map((f) => f.field).join(', ')}`
          : 'Please check your input and try again';

      case ErrorType.AUTHENTICATION:
        return 'Please log in to continue';

      case ErrorType.AUTHORIZATION:
        return "You don't have permission to perform this action";

      case ErrorType.NOT_FOUND:
        return 'The requested resource was not found';

      case ErrorType.CONFLICT:
        return 'This resource already exists or conflicts with existing data';

      case ErrorType.RATE_LIMIT:
        return 'Too many requests. Please wait a moment and try again';

      case ErrorType.TIMEOUT:
        return 'Request timed out. Please check your connection and try again';

      case ErrorType.NETWORK_ERROR:
        return 'Network connection failed. Please check your internet connection';

      case ErrorType.SERVER_ERROR:
        return 'A server error occurred. Please try again later';

      default:
        return 'An unexpected error occurred. Please try again';
    }
  }
}

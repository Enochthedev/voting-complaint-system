/**
 * Error Normalization System
 *
 * Provides consistent error handling and normalization across all API endpoints.
 * Includes field-level error details for validation errors and error context preservation.
 */

import { z } from 'zod';
import type { StandardApiError, ErrorDetails, ErrorContext, FieldError } from './types';
import { ErrorType } from './types';
import { sanitizeParameters } from './response-wrapper';

/**
 * Error normalization class
 */
export class ErrorNormalizer {
  /**
   * Normalize a generic error into a StandardApiError
   */
  static normalize(error: any, context?: Partial<ErrorContext>): StandardApiError {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return this.normalizeZodError(error, context);
    }

    // Handle Supabase errors
    if (error?.code && error?.message) {
      return this.normalizeSupabaseError(error, context);
    }

    // Handle standard JavaScript errors
    if (error instanceof Error) {
      return this.normalizeJavaScriptError(error, context);
    }

    // Handle HTTP errors
    if (error?.status || error?.statusCode) {
      return this.normalizeHttpError(error, context);
    }

    // Handle string errors
    if (typeof error === 'string') {
      return this.normalizeStringError(error, context);
    }

    // Default unknown error
    return this.createStandardError(
      ErrorType.UNKNOWN,
      'UNKNOWN_ERROR',
      'An unknown error occurred',
      context,
      { originalError: error }
    );
  }

  /**
   * Normalize Zod validation errors
   */
  private static normalizeZodError(
    error: z.ZodError,
    context?: Partial<ErrorContext>
  ): StandardApiError {
    const fieldErrors: FieldError[] = error.issues.map((err: any) => ({
      field: err.path.join('.'),
      code: err.code,
      message: err.message,
      value: 'received' in err ? err.received : undefined,
    }));

    const details: ErrorDetails = {
      fields: fieldErrors,
      context: {
        totalErrors: error.issues.length,
        errorCount: fieldErrors.length,
      },
    };

    return this.createStandardError(
      ErrorType.VALIDATION,
      'VALIDATION_ERROR',
      `Validation failed: ${fieldErrors.length} field(s) have errors`,
      context,
      details
    );
  }

  /**
   * Normalize Supabase errors
   */
  private static normalizeSupabaseError(
    error: any,
    context?: Partial<ErrorContext>
  ): StandardApiError {
    const errorTypeMap: Record<string, ErrorType> = {
      PGRST116: ErrorType.NOT_FOUND,
      PGRST301: ErrorType.AUTHENTICATION,
      '23505': ErrorType.CONFLICT, // Unique constraint violation
      '23503': ErrorType.VALIDATION, // Foreign key constraint violation
      '42501': ErrorType.AUTHORIZATION, // Insufficient privilege
    };

    const type = errorTypeMap[error.code] || ErrorType.SERVER_ERROR;

    const details: ErrorDetails = {
      context: {
        supabaseCode: error.code,
        hint: error.hint,
        details: error.details,
      },
    };

    return this.createStandardError(
      type,
      error.code || 'SUPABASE_ERROR',
      error.message || 'Database operation failed',
      context,
      details
    );
  }

  /**
   * Normalize JavaScript errors
   */
  private static normalizeJavaScriptError(
    error: Error,
    context?: Partial<ErrorContext>
  ): StandardApiError {
    let type = ErrorType.SERVER_ERROR;
    let code = 'JAVASCRIPT_ERROR';

    // Classify common JavaScript errors
    if (error.name === 'TypeError') {
      type = ErrorType.VALIDATION;
      code = 'TYPE_ERROR';
    } else if (error.name === 'ReferenceError') {
      type = ErrorType.SERVER_ERROR;
      code = 'REFERENCE_ERROR';
    } else if (error.name === 'SyntaxError') {
      type = ErrorType.VALIDATION;
      code = 'SYNTAX_ERROR';
    } else if (error.message.includes('timeout')) {
      type = ErrorType.TIMEOUT;
      code = 'TIMEOUT_ERROR';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      type = ErrorType.NETWORK_ERROR;
      code = 'NETWORK_ERROR';
    }

    const details: ErrorDetails = {
      context: {
        errorName: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    };

    return this.createStandardError(type, code, error.message, context, details);
  }

  /**
   * Normalize HTTP errors
   */
  private static normalizeHttpError(error: any, context?: Partial<ErrorContext>): StandardApiError {
    const status = error.status || error.statusCode;

    const statusTypeMap: Record<number, ErrorType> = {
      400: ErrorType.VALIDATION,
      401: ErrorType.AUTHENTICATION,
      403: ErrorType.AUTHORIZATION,
      404: ErrorType.NOT_FOUND,
      409: ErrorType.CONFLICT,
      429: ErrorType.RATE_LIMIT,
      500: ErrorType.SERVER_ERROR,
      502: ErrorType.SERVER_ERROR,
      503: ErrorType.SERVER_ERROR,
      504: ErrorType.TIMEOUT,
    };

    const type = statusTypeMap[status] || ErrorType.UNKNOWN;
    const code = `HTTP_${status}`;

    const details: ErrorDetails = {
      context: {
        httpStatus: status,
        statusText: error.statusText,
      },
    };

    return this.createStandardError(
      type,
      code,
      error.message || `HTTP ${status} error`,
      context,
      details
    );
  }

  /**
   * Normalize string errors
   */
  private static normalizeStringError(
    error: string,
    context?: Partial<ErrorContext>
  ): StandardApiError {
    return this.createStandardError(ErrorType.UNKNOWN, 'STRING_ERROR', error, context);
  }

  /**
   * Create a standardized error object
   */
  private static createStandardError(
    type: ErrorType,
    code: string,
    message: string,
    context?: Partial<ErrorContext>,
    details?: ErrorDetails
  ): StandardApiError {
    return {
      type,
      code,
      message,
      details,
      context: context
        ? {
            requestId: context.requestId || 'unknown',
            endpoint: context.endpoint || 'unknown',
            method: context.method || 'unknown',
            userId: context.userId,
            parameters: context.parameters ? sanitizeParameters(context.parameters) : undefined,
          }
        : undefined,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create field-level validation error
   */
  static createFieldError(field: string, code: string, message: string, value?: any): FieldError {
    return {
      field,
      code,
      message,
      value,
    };
  }

  /**
   * Create validation error with field errors
   */
  static createValidationError(
    fieldErrors: FieldError[],
    context?: Partial<ErrorContext>,
    message?: string
  ): StandardApiError {
    const details: ErrorDetails = {
      fields: fieldErrors,
      context: {
        totalErrors: fieldErrors.length,
      },
    };

    return this.createStandardError(
      ErrorType.VALIDATION,
      'VALIDATION_ERROR',
      message || `Validation failed: ${fieldErrors.length} field(s) have errors`,
      context,
      details
    );
  }

  /**
   * Create authentication error
   */
  static createAuthError(
    message: string = 'Authentication required',
    context?: Partial<ErrorContext>
  ): StandardApiError {
    return this.createStandardError(ErrorType.AUTHENTICATION, 'AUTH_ERROR', message, context);
  }

  /**
   * Create authorization error
   */
  static createAuthorizationError(
    message: string = 'Insufficient permissions',
    context?: Partial<ErrorContext>
  ): StandardApiError {
    return this.createStandardError(
      ErrorType.AUTHORIZATION,
      'AUTHORIZATION_ERROR',
      message,
      context
    );
  }

  /**
   * Create not found error
   */
  static createNotFoundError(resource: string, context?: Partial<ErrorContext>): StandardApiError {
    return this.createStandardError(
      ErrorType.NOT_FOUND,
      'NOT_FOUND',
      `${resource} not found`,
      context
    );
  }

  /**
   * Create conflict error
   */
  static createConflictError(message: string, context?: Partial<ErrorContext>): StandardApiError {
    return this.createStandardError(ErrorType.CONFLICT, 'CONFLICT_ERROR', message, context);
  }

  /**
   * Create rate limit error
   */
  static createRateLimitError(context?: Partial<ErrorContext>): StandardApiError {
    return this.createStandardError(
      ErrorType.RATE_LIMIT,
      'RATE_LIMIT_EXCEEDED',
      'Rate limit exceeded. Please try again later.',
      context
    );
  }

  /**
   * Create server error
   */
  static createServerError(
    message: string = 'Internal server error',
    context?: Partial<ErrorContext>
  ): StandardApiError {
    return this.createStandardError(ErrorType.SERVER_ERROR, 'SERVER_ERROR', message, context);
  }
}

/**
 * Utility function to normalize any error
 */
export function normalizeError(error: any, context?: Partial<ErrorContext>): StandardApiError {
  return ErrorNormalizer.normalize(error, context);
}

/**
 * Utility function to create field validation errors from Zod issues
 */
export function createFieldErrorsFromZod(zodError: z.ZodError): FieldError[] {
  return zodError.issues.map((err: any) => ({
    field: err.path.join('.'),
    code: err.code,
    message: err.message,
    value: 'received' in err ? err.received : undefined,
  }));
}

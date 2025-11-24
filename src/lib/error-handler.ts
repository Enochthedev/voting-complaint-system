/**
 * Error Handling Utilities
 * 
 * Provides utilities for handling and formatting errors consistently
 * across the application.
 */

import type { AuthError } from '@supabase/supabase-js';

/**
 * Error types that can occur in the application
 */
export enum ErrorType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

/**
 * Application error class with additional context
 */
export class AppError extends Error {
  type: ErrorType;
  statusCode?: number;
  details?: any;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    statusCode?: number,
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  return (
    error instanceof TypeError &&
    (error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch'))
  );
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: any): boolean {
  return (
    error?.status === 401 ||
    error?.message?.includes('auth') ||
    error?.message?.includes('unauthorized')
  );
}

/**
 * Format Supabase auth error for display
 */
export function formatAuthError(error: AuthError): string {
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': 'Invalid email or password. Please try again.',
    'Email not confirmed': 'Please verify your email address before logging in.',
    'User already registered': 'This email is already registered. Please sign in instead.',
    'Password should be at least 6 characters':
      'Password must be at least 8 characters long.',
    'Unable to validate email address: invalid format':
      'Please enter a valid email address.',
    'Signups not allowed for this instance':
      'Registration is currently disabled. Please contact support.',
    'Email rate limit exceeded':
      'Too many requests. Please wait a few minutes and try again.',
    'Invalid Refresh Token: Already Used':
      'Your session has expired. Please sign in again.',
  };

  // Check for exact matches
  if (errorMessages[error.message]) {
    return errorMessages[error.message];
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(errorMessages)) {
    if (error.message.includes(key)) {
      return value;
    }
  }

  // Default message
  return error.message || 'An authentication error occurred. Please try again.';
}

/**
 * Format generic error for display
 */
export function formatError(error: any): string {
  // Handle AppError
  if (error instanceof AppError) {
    return error.message;
  }

  // Handle AuthError
  if (error?.name === 'AuthError' || error?.__isAuthError) {
    return formatAuthError(error);
  }

  // Handle network errors
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection and try again.';
  }

  // Handle standard Error
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle object with message property
  if (error?.message) {
    return error.message;
  }

  // Default fallback
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Log error with context
 */
export function logError(
  error: any,
  context?: string,
  additionalInfo?: Record<string, any>
) {
  const errorInfo = {
    message: formatError(error),
    context,
    timestamp: new Date().toISOString(),
    ...additionalInfo,
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', errorInfo, error);
  } else {
    // In production, you might want to send to an error tracking service
    console.error('Error:', errorInfo.message);
  }
}

/**
 * Handle async errors with consistent error handling
 */
export async function handleAsync<T>(
  promise: Promise<T>,
  errorContext?: string
): Promise<[T | null, AppError | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    const appError = new AppError(
      formatError(error),
      isAuthError(error) ? ErrorType.AUTHENTICATION : ErrorType.UNKNOWN
    );

    if (errorContext) {
      logError(error, errorContext);
    }

    return [null, appError];
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on auth errors
      if (isAuthError(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (i === maxRetries - 1) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, i);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  // Network errors are retryable
  if (isNetworkError(error)) {
    return true;
  }

  // 5xx server errors are retryable
  if (error?.statusCode >= 500 && error?.statusCode < 600) {
    return true;
  }

  // Rate limit errors are retryable
  if (error?.statusCode === 429) {
    return true;
  }

  // Timeout errors are retryable
  if (error?.message?.includes('timeout')) {
    return true;
  }

  return false;
}

/**
 * Get user-friendly error title based on error type
 */
export function getErrorTitle(error: any): string {
  if (error instanceof AppError) {
    switch (error.type) {
      case ErrorType.AUTHENTICATION:
        return 'Authentication Error';
      case ErrorType.AUTHORIZATION:
        return 'Access Denied';
      case ErrorType.NETWORK:
        return 'Connection Error';
      case ErrorType.VALIDATION:
        return 'Validation Error';
      case ErrorType.NOT_FOUND:
        return 'Not Found';
      case ErrorType.SERVER:
        return 'Server Error';
      default:
        return 'Error';
    }
  }

  if (isAuthError(error)) {
    return 'Authentication Error';
  }

  if (isNetworkError(error)) {
    return 'Connection Error';
  }

  return 'Error';
}

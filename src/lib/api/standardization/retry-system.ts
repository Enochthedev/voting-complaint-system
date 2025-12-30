/**
 * Comprehensive Retry System with Exponential Backoff
 *
 * Provides retry logic with exponential backoff for recoverable errors,
 * automatic token refresh and request retry for auth errors,
 * and error classification (retryable vs non-retryable).
 */

import { supabase } from '@/lib/supabase';
import { withTimeout, TIMEOUT_CONFIG, TimeoutError } from '@/lib/timeout';
import { ErrorNormalizer } from './error-normalizer';
import { ErrorType } from './types';
import type { StandardApiError, ErrorContext } from './types';

/**
 * Retry configuration options
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterMs: number;
  timeoutMs: number;
  retryableErrors: ErrorType[];
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitterMs: 100,
  timeoutMs: TIMEOUT_CONFIG.default,
  retryableErrors: [
    ErrorType.NETWORK_ERROR,
    ErrorType.TIMEOUT,
    ErrorType.SERVER_ERROR, // Include server errors as retryable
    ErrorType.RATE_LIMIT,
  ],
};

/**
 * Retry attempt information
 */
export interface RetryAttempt {
  attempt: number;
  error: StandardApiError;
  delayMs: number;
  timestamp: string;
}

/**
 * Retry result with attempt history
 */
export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: StandardApiError;
  attempts: RetryAttempt[];
  totalDuration: number;
}

/**
 * Comprehensive retry system class
 */
export class RetrySystem {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  /**
   * Execute operation with retry logic
   */
  async execute<T>(
    operation: () => Promise<T>,
    context?: Partial<ErrorContext>,
    customConfig?: Partial<RetryConfig>
  ): Promise<RetryResult<T>> {
    const config = customConfig ? { ...this.config, ...customConfig } : this.config;
    const attempts: RetryAttempt[] = [];
    const startTime = Date.now();

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        // Validate session before each attempt
        await this.ensureValidSession();

        // Execute operation with timeout
        const result = await withTimeout(operation(), config.timeoutMs);

        return {
          success: true,
          data: result,
          attempts,
          totalDuration: Date.now() - startTime,
        };
      } catch (error: any) {
        const normalizedError = ErrorNormalizer.normalize(error, context);

        // Record attempt
        const delayMs = attempt < config.maxAttempts ? this.calculateDelay(attempt, config) : 0;
        attempts.push({
          attempt,
          error: normalizedError,
          delayMs,
          timestamp: new Date().toISOString(),
        });

        // Check if this is the last attempt
        if (attempt === config.maxAttempts) {
          return {
            success: false,
            error: normalizedError,
            attempts,
            totalDuration: Date.now() - startTime,
          };
        }

        // Check if error is retryable
        if (!this.isRetryableError(normalizedError, config)) {
          return {
            success: false,
            error: normalizedError,
            attempts,
            totalDuration: Date.now() - startTime,
          };
        }

        // Handle authentication errors with token refresh
        if (normalizedError.type === ErrorType.AUTHENTICATION) {
          const refreshSuccess = await this.handleAuthError();
          if (!refreshSuccess) {
            return {
              success: false,
              error: normalizedError,
              attempts,
              totalDuration: Date.now() - startTime,
            };
          }
        }

        // Wait before retry (except for auth errors which are retried immediately after refresh)
        if (normalizedError.type !== ErrorType.AUTHENTICATION && delayMs > 0) {
          await this.delay(delayMs);
        }
      }
    }

    // This should never be reached, but TypeScript requires it
    return {
      success: false,
      error: ErrorNormalizer.createServerError('Unexpected retry loop exit'),
      attempts,
      totalDuration: Date.now() - startTime,
    };
  }

  /**
   * Execute operation with automatic token refresh (simplified interface)
   */
  async executeWithTokenRefresh<T>(
    operation: () => Promise<T>,
    timeoutMs: number = TIMEOUT_CONFIG.default
  ): Promise<T> {
    const result = await this.execute(
      operation,
      undefined,
      { timeoutMs, maxAttempts: 2 } // Only retry once for auth errors
    );

    if (result.success) {
      return result.data!;
    }

    throw new Error(result.error?.message || 'Operation failed');
  }

  /**
   * Check if error is retryable based on configuration
   */
  private isRetryableError(error: StandardApiError, config: RetryConfig): boolean {
    // Always retry authentication errors (they get special handling)
    if (error.type === ErrorType.AUTHENTICATION) {
      return true;
    }

    // Check if error type is in retryable list
    if (config.retryableErrors.includes(error.type)) {
      return true;
    }

    // Also check for specific error patterns that should be retryable
    if (error.message?.toLowerCase().includes('network')) {
      return true;
    }

    if (error.message?.toLowerCase().includes('timeout')) {
      return true;
    }

    return false;
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    const exponentialDelay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
    const jitter = Math.random() * config.jitterMs;
    const totalDelay = exponentialDelay + jitter;

    return Math.min(totalDelay, config.maxDelayMs);
  }

  /**
   * Delay execution for specified milliseconds
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Ensure valid session exists
   */
  private async ensureValidSession(): Promise<void> {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      const { data, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError || !data.session) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login?reason=session_expired';
        }
        throw ErrorNormalizer.createAuthError('Session expired. Please log in again.');
      }
    }
  }

  /**
   * Handle authentication errors by refreshing token
   */
  private async handleAuthError(): Promise<boolean> {
    try {
      const { data, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError || !data.session) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login?reason=token_refresh_failed';
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to refresh session after auth error:', error);
      return false;
    }
  }

  /**
   * Create retry system with custom configuration
   */
  static create(config: Partial<RetryConfig> = {}): RetrySystem {
    return new RetrySystem(config);
  }

  /**
   * Create retry system for authentication operations
   */
  static createForAuth(): RetrySystem {
    return new RetrySystem({
      maxAttempts: 2,
      baseDelayMs: 500,
      retryableErrors: [ErrorType.AUTHENTICATION, ErrorType.NETWORK_ERROR, ErrorType.TIMEOUT],
    });
  }

  /**
   * Create retry system for API operations
   */
  static createForApi(): RetrySystem {
    return new RetrySystem({
      maxAttempts: 3,
      baseDelayMs: 1000,
      retryableErrors: [
        ErrorType.NETWORK_ERROR,
        ErrorType.TIMEOUT,
        ErrorType.SERVER_ERROR,
        ErrorType.RATE_LIMIT,
      ],
    });
  }

  /**
   * Create retry system for critical operations
   */
  static createForCritical(): RetrySystem {
    return new RetrySystem({
      maxAttempts: 5,
      baseDelayMs: 2000,
      maxDelayMs: 60000,
      retryableErrors: [
        ErrorType.NETWORK_ERROR,
        ErrorType.TIMEOUT,
        ErrorType.SERVER_ERROR,
        ErrorType.RATE_LIMIT,
      ],
    });
  }
}

/**
 * Default retry system instances
 */
export const RetryInstances = {
  /**
   * Default retry system for general operations
   */
  default: new RetrySystem(),

  /**
   * Retry system for authentication operations
   */
  auth: RetrySystem.createForAuth(),

  /**
   * Retry system for API operations
   */
  api: RetrySystem.createForApi(),

  /**
   * Retry system for critical operations
   */
  critical: RetrySystem.createForCritical(),
};

/**
 * Utility function for backward compatibility with existing withTokenRefresh
 */
export async function withTokenRefresh<T>(
  apiCall: () => Promise<T>,
  timeoutMs: number = TIMEOUT_CONFIG.default
): Promise<T> {
  return RetryInstances.auth.executeWithTokenRefresh(apiCall, timeoutMs);
}

/**
 * Enhanced utility function with full retry capabilities
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config?: Partial<RetryConfig>,
  context?: Partial<ErrorContext>
): Promise<T> {
  const retrySystem = new RetrySystem(config);
  const result = await retrySystem.execute(operation, context);

  if (result.success) {
    return result.data!;
  }

  throw new Error(result.error?.message || 'Operation failed after retries');
}

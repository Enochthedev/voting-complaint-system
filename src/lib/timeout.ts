/**
 * Request Timeout Utilities
 *
 * Provides utilities to add timeout capability to async operations,
 * preventing requests from hanging indefinitely.
 */

/**
 * Timeout Error Class
 */
export class TimeoutError extends Error {
  constructor(
    message: string,
    public timeoutMs: number
  ) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Wrap a promise with a timeout
 *
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param errorMessage - Custom error message
 * @returns Promise that rejects if timeout is exceeded
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000,
  errorMessage?: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      const message = errorMessage || `Request timed out after ${timeoutMs}ms`;
      reject(new TimeoutError(message, timeoutMs));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Create an AbortController with timeout
 *
 * @param timeoutMs - Timeout in milliseconds
 * @returns Object with controller and cleanup function
 */
export function createTimeoutController(timeoutMs: number = 30000): {
  controller: AbortController;
  cleanup: () => void;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  const cleanup = () => {
    clearTimeout(timeoutId);
  };

  return { controller, cleanup };
}

/**
 * Wrap an async function to automatically add timeout
 *
 * @param fn - Async function to wrap
 * @param defaultTimeout - Default timeout in milliseconds
 * @returns Wrapped function with timeout
 */
export function withTimeoutWrapper<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  defaultTimeout: number = 30000
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return withTimeout(fn(...args), defaultTimeout);
  }) as T;
}

/**
 * Configuration for different operation types
 */
export const TIMEOUT_CONFIG = {
  // Read operations - 15 seconds
  read: 15000,
  // Write operations - 30 seconds
  write: 30000,
  // Bulk operations - 60 seconds
  bulk: 60000,
  // Auth operations - 10 seconds
  auth: 10000,
  // Search operations - 20 seconds
  search: 20000,
  // File upload operations - 120 seconds (2 minutes)
  upload: 120000,
  // Default - 30 seconds
  default: 30000,
} as const;

/**
 * Get timeout for operation type
 */
export function getTimeoutForOperation(operationType: keyof typeof TIMEOUT_CONFIG): number {
  return TIMEOUT_CONFIG[operationType] || TIMEOUT_CONFIG.default;
}

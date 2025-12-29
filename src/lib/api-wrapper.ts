/**
 * API Wrapper with Automatic Token Refresh, Timeout, and Monitoring
 *
 * Wraps API calls to automatically refresh tokens if they expire,
 * retry the request with the fresh token, add timeout capability,
 * and collect monitoring metrics.
 *
 * This module provides backward compatibility while leveraging the new
 * comprehensive retry system and monitoring capabilities.
 */

import { TIMEOUT_CONFIG } from '@/lib/timeout';
import { withTokenRefresh as newWithTokenRefresh } from './api/standardization/retry-system';
import { withMonitoring, type ApiCallContext } from './api/standardization/monitoring-wrapper';

/**
 * Wrap an API call with automatic token refresh on auth errors and timeout
 *
 * @param apiCall - The API function to call
 * @param timeoutMs - Optional timeout in milliseconds (default: 30 seconds)
 * @returns The result of the API call
 *
 * @deprecated Use the new retry system from standardization/retry-system.ts for enhanced capabilities
 */
export async function withTokenRefresh<T>(
  apiCall: () => Promise<T>,
  timeoutMs: number = TIMEOUT_CONFIG.default
): Promise<T> {
  // Delegate to the new comprehensive retry system
  return newWithTokenRefresh(apiCall, timeoutMs);
}

/**
 * Enhanced API wrapper with monitoring integration
 *
 * @param apiCall - The API function to call
 * @param context - Monitoring context (endpoint, method, etc.)
 * @param timeoutMs - Optional timeout in milliseconds
 * @returns The result of the API call with monitoring
 */
export function withMonitoredTokenRefresh<T>(
  apiCall: () => Promise<T>,
  context: ApiCallContext,
  timeoutMs: number = TIMEOUT_CONFIG.default
): () => Promise<T> {
  // Combine monitoring with token refresh
  const monitoredCall = withMonitoring(apiCall, context);

  return () => newWithTokenRefresh(monitoredCall, timeoutMs);
}

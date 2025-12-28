/**
 * API Wrapper with Automatic Token Refresh and Timeout
 *
 * Wraps API calls to automatically refresh tokens if they expire,
 * retry the request with the fresh token, and add timeout capability.
 */

import { supabase } from '@/lib/supabase';
import { withTimeout, TIMEOUT_CONFIG, TimeoutError } from '@/lib/timeout';

/**
 * Wrap an API call with automatic token refresh on auth errors and timeout
 *
 * @param apiCall - The API function to call
 * @param timeoutMs - Optional timeout in milliseconds (default: 30 seconds)
 * @returns The result of the API call
 */
export async function withTokenRefresh<T>(
  apiCall: () => Promise<T>,
  timeoutMs: number = TIMEOUT_CONFIG.default
): Promise<T> {
  try {
    // Wrap entire operation with timeout
    return await withTimeout(
      (async () => {
        // Validate session before making API call
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        // If no session or session error, try to refresh first
        if (sessionError || !session) {
          console.log('No valid session found, attempting refresh before API call...');
          const { data, error: refreshError } = await supabase.auth.refreshSession();

          if (refreshError || !data.session) {
            console.error('Session refresh failed before API call:', refreshError);
            if (typeof window !== 'undefined') {
              window.location.href = '/login?reason=session_expired';
            }
            throw new Error('Session expired. Please log in again.');
          }
        }

        // Try the API call
        return await apiCall();
      })(),
      timeoutMs
    );
  } catch (error: any) {
    // Check if it's a timeout error - don't retry
    if (error instanceof TimeoutError) {
      console.error('API call timed out:', error.message);
      throw error;
    }

    // Check if it's an auth error (401 or specific auth-related error codes)
    const isAuthError =
      error?.status === 401 ||
      error?.code === 'PGRST301' || // PostgREST auth error
      (error?.message?.includes('JWT') && !error?.message?.includes('invalid claim')) ||
      (error?.message?.includes('token') && error?.message?.includes('expired'));

    if (isAuthError) {
      console.log('Auth error detected during API call, refreshing session...');

      // Try to refresh the session
      const { data, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError || !data.session) {
        console.error('Failed to refresh session after auth error:', refreshError);
        // If refresh fails, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login?reason=token_refresh_failed';
        }
        throw error;
      }

      console.log('Session refreshed successfully, retrying API call...');

      // Retry the API call with fresh token
      try {
        return await apiCall();
      } catch (retryError: any) {
        console.error('API call failed after token refresh:', retryError);
        throw retryError;
      }
    }

    // If it's not an auth error, just throw it
    throw error;
  }
}

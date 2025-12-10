/**
 * API Wrapper with Automatic Token Refresh
 *
 * Wraps API calls to automatically refresh tokens if they expire
 * and retry the request with the fresh token.
 */

import { supabase } from '@/lib/supabase';

/**
 * Wrap an API call with automatic token refresh on auth errors
 *
 * @param apiCall - The API function to call
 * @returns The result of the API call
 */
export async function withTokenRefresh<T>(apiCall: () => Promise<T>): Promise<T> {
  try {
    // Try the API call first
    return await apiCall();
  } catch (error: any) {
    // Check if it's an auth error
    const isAuthError =
      error?.message?.includes('JWT') ||
      error?.message?.includes('token') ||
      error?.message?.includes('expired') ||
      error?.message?.includes('invalid') ||
      error?.code === 'PGRST301' || // PostgREST auth error
      error?.status === 401;

    if (isAuthError) {
      console.log('Auth error detected, refreshing session...');

      // Try to refresh the session
      // Using singleton supabase client
      const { data, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError || !data.session) {
        console.error('Failed to refresh session:', refreshError);
        // If refresh fails, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw error;
      }

      console.log('Session refreshed successfully, retrying API call...');

      // Retry the API call with fresh token
      return await apiCall();
    }

    // If it's not an auth error, just throw it
    throw error;
  }
}

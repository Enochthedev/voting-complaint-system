/**
 * Supabase Client with CSRF Protection
 *
 * This module provides a wrapper around the Supabase client that
 * automatically includes CSRF tokens in requests when needed.
 */

import { createBrowserClient } from '@supabase/ssr';

/**
 * Create a Supabase client with CSRF token support
 *
 * @param csrfToken - CSRF token to include in requests
 * @returns Supabase client instance
 */
export function createCsrfProtectedSupabaseClient(csrfToken?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Create base client
  const client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: csrfToken
        ? {
            'x-csrf-token': csrfToken,
          }
        : {},
    },
  });

  return client;
}

/**
 * Add CSRF token to existing Supabase client
 *
 * This is useful when you need to add CSRF protection to an existing client instance
 *
 * @param token - CSRF token
 * @returns Headers object with CSRF token
 */
export function getCsrfHeaders(token: string): Record<string, string> {
  return {
    'x-csrf-token': token,
  };
}

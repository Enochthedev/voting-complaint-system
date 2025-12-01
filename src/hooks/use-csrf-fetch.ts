/**
 * CSRF-Protected Fetch Hook
 *
 * This hook provides a fetch wrapper that automatically includes
 * CSRF tokens in requests that require protection.
 */

'use client';

import { useCallback } from 'react';
import { useCsrfToken } from '@/components/providers/csrf-provider';

interface FetchOptions extends RequestInit {
  skipCsrf?: boolean;
}

/**
 * Hook for making CSRF-protected fetch requests
 *
 * Automatically includes CSRF token in headers for state-changing requests
 * (POST, PUT, PATCH, DELETE)
 */
export function useCsrfFetch() {
  const { token, isLoading } = useCsrfToken();

  const csrfFetch = useCallback(
    async (url: string, options: FetchOptions = {}) => {
      const { skipCsrf = false, ...fetchOptions } = options;

      // Determine if this request needs CSRF protection
      const method = (fetchOptions.method || 'GET').toUpperCase();
      const needsCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

      // If CSRF is needed but token is not available, wait or throw error
      if (needsCsrf && !skipCsrf && !token) {
        if (isLoading) {
          throw new Error('CSRF token is still loading. Please try again.');
        }
        throw new Error('CSRF token is not available');
      }

      // Add CSRF token to headers if needed
      const headers = new Headers(fetchOptions.headers);

      if (needsCsrf && !skipCsrf && token) {
        headers.set('x-csrf-token', token);
      }

      // Ensure Content-Type is set for JSON requests
      if (
        fetchOptions.body &&
        typeof fetchOptions.body === 'string' &&
        !headers.has('Content-Type')
      ) {
        headers.set('Content-Type', 'application/json');
      }

      // Make the request
      return fetch(url, {
        ...fetchOptions,
        headers,
      });
    },
    [token, isLoading]
  );

  return {
    csrfFetch,
    token,
    isLoading,
  };
}

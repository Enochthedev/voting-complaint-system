/**
 * CSRF Token Provider
 *
 * This component provides CSRF token context to the entire application,
 * making it available for all API requests that require CSRF protection.
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface CsrfContextType {
  token: string | null;
  isLoading: boolean;
}

const CsrfContext = createContext<CsrfContextType>({
  token: null,
  isLoading: true,
});

/**
 * Hook to access CSRF token
 */
export function useCsrfToken() {
  const context = useContext(CsrfContext);

  if (!context) {
    throw new Error('useCsrfToken must be used within CsrfProvider');
  }

  return context;
}

interface CsrfProviderProps {
  children: React.ReactNode;
  initialToken?: string;
}

/**
 * CSRF Provider Component
 *
 * Provides CSRF token to all child components and automatically
 * fetches a new token if not provided.
 */
export function CsrfProvider({ children, initialToken }: CsrfProviderProps) {
  const [token, setToken] = useState<string | null>(initialToken || null);
  const [isLoading, setIsLoading] = useState(!initialToken);

  useEffect(() => {
    // If we already have a token, don't fetch
    if (initialToken) {
      setIsLoading(false);
      return;
    }

    // Fetch CSRF token from API
    async function fetchToken() {
      try {
        const response = await fetch('/api/csrf-token');

        if (!response.ok) {
          throw new Error('Failed to fetch CSRF token');
        }

        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchToken();
  }, [initialToken]);

  return <CsrfContext.Provider value={{ token, isLoading }}>{children}</CsrfContext.Provider>;
}

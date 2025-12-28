'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

/**
 * React Query configuration for the Student Complaint System
 *
 * Default settings:
 * - staleTime: 1 minute - Data is considered fresh for 1 minute
 * - gcTime: 10 minutes - Unused data is garbage collected after 10 minutes
 * - refetchOnWindowFocus: true - Refetch when user returns to the tab
 * - refetchOnMount: true - Always refetch on component mount for fresh data
 * - refetchOnReconnect: true - Refetch when network reconnects
 * - retry: 2 - Retry failed requests twice
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // CRITICAL: Set staleTime to 0 to always fetch fresh data
        // This ensures browser refresh always loads new data
        staleTime: 0,
        // Unused data is garbage collected after 5 minutes
        gcTime: 5 * 60 * 1000,
        // Refetch when user returns to the tab
        refetchOnWindowFocus: true,
        // Retry failed requests with exponential backoff
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          // Retry up to 2 times for other errors
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // CRITICAL: Always refetch on mount, even if data exists
        // This ensures page refresh loads fresh data
        refetchOnMount: 'always',
        // Refetch when network reconnects
        refetchOnReconnect: true,
        // CRITICAL: Don't throw errors to error boundaries by default
        // This prevents one failed query from breaking the entire page
        throwOnError: false,
      },
      mutations: {
        // Don't retry mutations by default (they might have side effects)
        retry: false,
        // Don't throw mutation errors to error boundaries
        // Handle them in onError callbacks instead
        throwOnError: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

interface ReactQueryProviderProps {
  children: ReactNode;
}

/**
 * React Query Provider Component
 * 
 * Wraps the application with React Query context and provides:
 * - Automatic caching of API requests
 * - Background refetching
 * - Request deduplication
 * - Optimistic updates
 * - DevTools for debugging (development only)
 */
export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}

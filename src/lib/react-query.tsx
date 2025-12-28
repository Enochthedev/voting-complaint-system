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
        // Data is considered fresh for 1 minute (reduced from 5 for more current data)
        staleTime: 1 * 60 * 1000,
        // Unused data is garbage collected after 10 minutes
        gcTime: 10 * 60 * 1000,
        // Refetch when user returns to the tab
        refetchOnWindowFocus: true,
        // Retry failed requests twice (improved from once)
        retry: 2,
        // Always refetch on mount to ensure fresh data after page refresh
        refetchOnMount: true,
        // Refetch when network reconnects
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
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

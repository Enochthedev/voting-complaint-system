'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';
import {
  createEnhancedQueryClient,
  globalCacheManager,
} from './api/standardization/enhanced-cache';

/**
 * React Query configuration for the Student Complaint System
 *
 * Enhanced with:
 * - Intelligent cache policies based on data type
 * - Persistent storage for offline support
 * - Smart garbage collection
 * - Request deduplication and batching
 * - Performance monitoring
 */
function makeQueryClient() {
  // Use enhanced cache manager for better performance
  return createEnhancedQueryClient({
    ttl: 5 * 60 * 1000, // 5 minutes default
    maxSize: 1000,
    strategy: 'lru',
    persistentStorage: true,
    storageKey: 'complaint-system-cache',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    intelligentGC: true,
    gcInterval: 5 * 60 * 1000, // 5 minutes
    memoryThreshold: 50 * 1024 * 1024, // 50MB
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

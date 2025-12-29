import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook as originalRenderHook } from '@testing-library/react';

// Create a test query client
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Test wrapper component
export function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

// Custom renderHook with React Query provider
export function renderHook<TResult, TProps>(
  callback: (props: TProps) => TResult,
  options?: { initialProps?: TProps }
) {
  return originalRenderHook(callback, {
    wrapper: TestWrapper,
    ...options,
  });
}

export * from '@testing-library/react';

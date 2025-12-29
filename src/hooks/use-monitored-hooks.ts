/**
 * Monitored Hooks Wrapper
 *
 * Provides monitoring integration for existing React hooks to track
 * performance, errors, and usage patterns.
 */

'use client';

import { useEffect, useRef } from 'react';
import { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { MonitoringDashboard } from '@/lib/api/standardization/monitoring-wrapper';

/**
 * Hook to monitor query performance and errors
 */
export function useMonitoredQuery<T>(
  queryResult: UseQueryResult<T>,
  operationName: string,
  category: string = 'query',
  tags?: Record<string, any>
) {
  const startTimeRef = useRef<number>(Date.now());
  const hasLoggedRef = useRef<boolean>(false);

  useEffect(() => {
    // Reset on new query
    if (queryResult.isFetching && !hasLoggedRef.current) {
      startTimeRef.current = Date.now();
      hasLoggedRef.current = false;
    }

    // Log when query completes
    if (!queryResult.isFetching && !hasLoggedRef.current) {
      const duration = Date.now() - startTimeRef.current;
      hasLoggedRef.current = true;

      if (queryResult.isError) {
        MonitoringDashboard.recordError({
          operation: operationName,
          category,
          error: queryResult.error as Error,
          duration,
          tags: {
            ...tags,
            queryKey: JSON.stringify(queryResult.dataUpdatedAt),
            isBackground: queryResult.isLoadingError ? 'true' : 'false',
          },
        });
      } else if (queryResult.isSuccess) {
        MonitoringDashboard.recordSuccess({
          operation: operationName,
          category,
          duration,
          tags: {
            ...tags,
            queryKey: JSON.stringify(queryResult.dataUpdatedAt),
            cacheHit: queryResult.isStale ? 'false' : 'true',
          },
        });
      }
    }
  }, [
    queryResult.isFetching,
    queryResult.isError,
    queryResult.isSuccess,
    queryResult.error,
    operationName,
    category,
    tags,
  ]);

  // Monitor stale data usage
  useEffect(() => {
    if (queryResult.isStale && queryResult.data) {
      MonitoringDashboard.recordMetric({
        operation: operationName,
        category,
        metric: 'stale_data_usage',
        value: 1,
        tags: {
          ...tags,
          dataAge: Date.now() - (queryResult.dataUpdatedAt || 0),
        },
      });
    }
  }, [
    queryResult.isStale,
    queryResult.data,
    queryResult.dataUpdatedAt,
    operationName,
    category,
    tags,
  ]);

  return queryResult;
}

/**
 * Hook to monitor mutation performance and errors
 */
export function useMonitoredMutation<T, V>(
  mutationResult: UseMutationResult<T, Error, V>,
  operationName: string,
  category: string = 'mutation',
  tags?: Record<string, any>
) {
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Track mutation start
    if (mutationResult.isPending && startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }

    // Track mutation completion
    if (!mutationResult.isPending && startTimeRef.current !== null) {
      const duration = Date.now() - startTimeRef.current;
      startTimeRef.current = null;

      if (mutationResult.isError) {
        MonitoringDashboard.recordError({
          operation: operationName,
          category,
          error: mutationResult.error,
          duration,
          tags: {
            ...tags,
            mutationId: mutationResult.submittedAt?.toString() || 'unknown',
            failureCount: mutationResult.failureCount,
          },
        });
      } else if (mutationResult.isSuccess) {
        MonitoringDashboard.recordSuccess({
          operation: operationName,
          category,
          duration,
          tags: {
            ...tags,
            mutationId: mutationResult.submittedAt?.toString() || 'unknown',
            retryCount: mutationResult.failureCount,
          },
        });
      }
    }
  }, [
    mutationResult.isPending,
    mutationResult.isError,
    mutationResult.isSuccess,
    mutationResult.error,
    mutationResult.failureCount,
    mutationResult.submittedAt,
    operationName,
    category,
    tags,
  ]);

  // Monitor retry patterns
  useEffect(() => {
    if (mutationResult.failureCount > 0) {
      MonitoringDashboard.recordMetric({
        operation: operationName,
        category,
        metric: 'mutation_retry',
        value: mutationResult.failureCount,
        tags: {
          ...tags,
          mutationId: mutationResult.submittedAt?.toString() || 'unknown',
        },
      });
    }
  }, [mutationResult.failureCount, mutationResult.submittedAt, operationName, category, tags]);

  return mutationResult;
}

/**
 * Hook to monitor real-time connection status
 */
export function useMonitoredConnection(
  connectionState: string,
  operationName: string,
  category: string = 'realtime',
  tags?: Record<string, any>
) {
  const previousStateRef = useRef<string>('');

  useEffect(() => {
    if (previousStateRef.current !== connectionState) {
      // Record connection state changes
      MonitoringDashboard.recordMetric({
        operation: operationName,
        category,
        metric: 'connection_state_change',
        value: 1,
        tags: {
          ...tags,
          fromState: previousStateRef.current || 'initial',
          toState: connectionState,
          timestamp: Date.now(),
        },
      });

      // Record specific events
      if (connectionState === 'connected') {
        MonitoringDashboard.recordSuccess({
          operation: operationName,
          category,
          duration: 0,
          tags: {
            ...tags,
            event: 'connection_established',
          },
        });
      } else if (connectionState === 'error') {
        MonitoringDashboard.recordError({
          operation: operationName,
          category,
          error: new Error('Connection failed'),
          duration: 0,
          tags: {
            ...tags,
            event: 'connection_failed',
          },
        });
      }

      previousStateRef.current = connectionState;
    }
  }, [connectionState, operationName, category, tags]);

  // Monitor connection uptime
  useEffect(() => {
    if (connectionState === 'connected') {
      const interval = setInterval(() => {
        MonitoringDashboard.recordMetric({
          operation: operationName,
          category,
          metric: 'connection_uptime',
          value: 1,
          tags: {
            ...tags,
            state: connectionState,
          },
        });
      }, 60000); // Record every minute

      return () => clearInterval(interval);
    }
  }, [connectionState, operationName, category, tags]);
}

/**
 * Hook to monitor hook usage patterns
 */
export function useMonitoredHookUsage(
  hookName: string,
  parameters?: Record<string, any>,
  category: string = 'hook_usage'
) {
  const mountTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Record hook mount
    MonitoringDashboard.recordMetric({
      operation: hookName,
      category,
      metric: 'hook_mount',
      value: 1,
      tags: {
        parameters: parameters ? JSON.stringify(parameters) : 'none',
        mountTime: mountTimeRef.current,
      },
    });

    // Record hook unmount on cleanup
    return () => {
      const duration = Date.now() - mountTimeRef.current;
      MonitoringDashboard.recordMetric({
        operation: hookName,
        category,
        metric: 'hook_unmount',
        value: 1,
        tags: {
          parameters: parameters ? JSON.stringify(parameters) : 'none',
          duration,
        },
      });
    };
  }, [hookName, parameters, category]);
}

/**
 * Hook to monitor cache performance
 */
export function useMonitoredCache(
  queryResult: UseQueryResult<any>,
  operationName: string,
  category: string = 'cache'
) {
  useEffect(() => {
    if (queryResult.data) {
      // Record cache hit/miss
      MonitoringDashboard.recordMetric({
        operation: operationName,
        category,
        metric: queryResult.isStale ? 'cache_miss' : 'cache_hit',
        value: 1,
        tags: {
          dataAge: queryResult.dataUpdatedAt ? Date.now() - queryResult.dataUpdatedAt : 0,
          isBackground: queryResult.isLoadingError ? 'true' : 'false',
        },
      });
    }
  }, [queryResult.data, queryResult.isStale, queryResult.dataUpdatedAt, operationName, category]);

  // Monitor cache invalidation patterns
  useEffect(() => {
    if (queryResult.isRefetching) {
      MonitoringDashboard.recordMetric({
        operation: operationName,
        category,
        metric: 'cache_invalidation',
        value: 1,
        tags: {
          trigger: queryResult.isRefetchError ? 'error' : 'manual',
        },
      });
    }
  }, [queryResult.isRefetching, queryResult.isRefetchError, operationName, category]);
}

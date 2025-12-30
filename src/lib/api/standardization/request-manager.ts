/**
 * Integrated Request Manager
 *
 * Combines request lifecycle management and offline queuing
 * into a unified API for handling all request scenarios.
 */

import {
  requestLifecycleManager,
  navigationCancellation,
  CancellationReason,
  type RequestMetadata,
  type CancellableRequest,
} from './request-lifecycle';
import {
  offlineRequestQueue,
  shouldQueueRequest,
  RequestPriority,
  type SerializableRequest,
} from './offline-queue';
import { withTokenRefresh } from './retry-system';
import { supabase } from '@/lib/supabase';

/**
 * Request execution options
 */
export interface RequestManagerOptions {
  priority?: RequestPriority;
  maxRetries?: number;
  timeout?: number;
  component?: string;
  route?: string;
  headers?: Record<string, string>;
  offlineSupport?: boolean;
  cancellable?: boolean;
}

/**
 * Request execution result
 */
export interface RequestResult<T> {
  data?: T;
  queued?: boolean;
  requestId?: string;
  cancelled?: boolean;
  error?: Error;
}

/**
 * Integrated request manager
 */
export class RequestManager {
  /**
   * Execute a request with full lifecycle management
   */
  async executeRequest<T>(
    requestFn: (signal?: AbortSignal) => Promise<T>,
    metadata: {
      endpoint: string;
      method: string;
      data?: any;
    },
    options: RequestManagerOptions = {}
  ): Promise<RequestResult<T>> {
    const {
      priority = RequestPriority.NORMAL,
      maxRetries = 3,
      timeout = 30000,
      component,
      route,
      headers = {},
      offlineSupport = true,
      cancellable = true,
    } = options;

    // Check if we should queue the request due to offline status
    if (offlineSupport && shouldQueueRequest()) {
      const requestId = offlineRequestQueue.enqueueRequest(
        metadata.endpoint,
        metadata.method,
        metadata.data,
        {
          priority,
          maxRetries,
          headers,
          metadata: {
            endpoint: metadata.endpoint,
            method: metadata.method,
            component,
            route,
          },
        }
      );

      return {
        queued: true,
        requestId,
      };
    }

    // Execute request with cancellation support if enabled
    if (cancellable) {
      const cancellableRequest = requestLifecycleManager.createCancellableRequest(
        async (signal: AbortSignal) => {
          return withTokenRefresh(async () => {
            return requestFn(signal);
          }, timeout);
        },
        {
          endpoint: metadata.endpoint,
          method: metadata.method,
          component,
          route,
        }
      );

      try {
        const data = await cancellableRequest.promise;
        return { data };
      } catch (error: any) {
        if (error.message === 'Request was cancelled') {
          return { cancelled: true };
        }
        return { error };
      }
    }

    // Execute request without cancellation support
    try {
      const data = await withTokenRefresh(() => requestFn(), timeout);
      return { data };
    } catch (error: any) {
      return { error };
    }
  }

  /**
   * Execute a Supabase query with full lifecycle management
   */
  async executeSupabaseQuery<T>(
    queryBuilder: (client: typeof supabase) => any,
    metadata: {
      endpoint: string;
      method: string;
      data?: any;
    },
    options: RequestManagerOptions = {}
  ): Promise<RequestResult<T>> {
    return this.executeRequest(
      async (signal?: AbortSignal) => {
        const query = queryBuilder(supabase);
        const { data, error } = await query;

        if (error) {
          throw error;
        }

        return data;
      },
      metadata,
      options
    );
  }

  /**
   * Cancel all requests for a component
   */
  cancelComponentRequests(componentId: string): void {
    requestLifecycleManager.cancelComponentRequests(
      componentId,
      CancellationReason.COMPONENT_UNMOUNT
    );
  }

  /**
   * Cancel all requests for a route
   */
  cancelRouteRequests(route: string): void {
    requestLifecycleManager.cancelRouteRequests(route, CancellationReason.NAVIGATION);
  }

  /**
   * Handle navigation change
   */
  handleNavigation(newRoute: string): void {
    navigationCancellation.handleRouteChange(newRoute);
  }

  /**
   * Get request statistics
   */
  getRequestStats(): {
    active: number;
    queued: number;
    queueStatus: ReturnType<typeof offlineRequestQueue.getQueueStatus>;
    networkOnline: boolean;
  } {
    return {
      active: requestLifecycleManager.getActiveRequestsCount(),
      queued: offlineRequestQueue.getQueuedRequests().length,
      queueStatus: offlineRequestQueue.getQueueStatus(),
      networkOnline: offlineRequestQueue.getNetworkStatus().online,
    };
  }

  /**
   * Process offline queue manually
   */
  async processOfflineQueue() {
    return offlineRequestQueue.processQueue();
  }

  /**
   * Clear offline queue
   */
  clearOfflineQueue(): void {
    offlineRequestQueue.clearQueue();
  }

  /**
   * Add network status listener
   */
  addNetworkStatusListener(listener: (online: boolean) => void): () => void {
    return offlineRequestQueue.addNetworkStatusListener((status) => {
      listener(status.online);
    });
  }
}

/**
 * Global request manager instance
 */
export const requestManager = new RequestManager();

/**
 * Convenience functions for common request patterns
 */

/**
 * Execute a GET request with lifecycle management
 */
export async function get<T>(
  endpoint: string,
  options: RequestManagerOptions = {}
): Promise<RequestResult<T>> {
  return requestManager.executeSupabaseQuery(
    (client) => client.from(endpoint).select(),
    { endpoint, method: 'GET' },
    options
  );
}

/**
 * Execute a POST request with lifecycle management
 */
export async function post<T>(
  endpoint: string,
  data: any,
  options: RequestManagerOptions = {}
): Promise<RequestResult<T>> {
  return requestManager.executeSupabaseQuery(
    (client) => client.from(endpoint).insert(data),
    { endpoint, method: 'POST', data },
    options
  );
}

/**
 * Execute a PUT request with lifecycle management
 */
export async function put<T>(
  endpoint: string,
  id: string,
  data: any,
  options: RequestManagerOptions = {}
): Promise<RequestResult<T>> {
  return requestManager.executeSupabaseQuery(
    (client) => client.from(endpoint).update(data).eq('id', id),
    { endpoint, method: 'PUT', data: { id, ...data } },
    options
  );
}

/**
 * Execute a DELETE request with lifecycle management
 */
export async function del<T>(
  endpoint: string,
  id: string,
  options: RequestManagerOptions = {}
): Promise<RequestResult<T>> {
  return requestManager.executeSupabaseQuery(
    (client) => client.from(endpoint).delete().eq('id', id),
    { endpoint, method: 'DELETE', data: { id } },
    options
  );
}

/**
 * React hook for request management (interface only)
 */
export function useRequestManager(componentId: string, route?: string) {
  const executeRequest = <T>(
    requestFn: (signal?: AbortSignal) => Promise<T>,
    metadata: { endpoint: string; method: string; data?: any },
    options: Omit<RequestManagerOptions, 'component' | 'route'> = {}
  ) => {
    return requestManager.executeRequest(requestFn, metadata, {
      ...options,
      component: componentId,
      route,
    });
  };

  const cancelAllRequests = () => {
    requestManager.cancelComponentRequests(componentId);
  };

  return {
    executeRequest,
    cancelAllRequests,
    get: <T>(endpoint: string, options: Omit<RequestManagerOptions, 'component' | 'route'> = {}) =>
      get<T>(endpoint, { ...options, component: componentId, route }),
    post: <T>(
      endpoint: string,
      data: any,
      options: Omit<RequestManagerOptions, 'component' | 'route'> = {}
    ) => post<T>(endpoint, data, { ...options, component: componentId, route }),
    put: <T>(
      endpoint: string,
      id: string,
      data: any,
      options: Omit<RequestManagerOptions, 'component' | 'route'> = {}
    ) => put<T>(endpoint, id, data, { ...options, component: componentId, route }),
    del: <T>(
      endpoint: string,
      id: string,
      options: Omit<RequestManagerOptions, 'component' | 'route'> = {}
    ) => del<T>(endpoint, id, { ...options, component: componentId, route }),
  };
}

/**
 * Navigation helper for automatic request cancellation
 */
export function setupNavigationCancellation() {
  // This would integrate with Next.js router or similar
  // For now, we provide the interface

  const handleRouteChange = (newRoute: string) => {
    requestManager.handleNavigation(newRoute);
  };

  return {
    handleRouteChange,
  };
}

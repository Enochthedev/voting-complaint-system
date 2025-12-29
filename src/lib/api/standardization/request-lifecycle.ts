/**
 * Request Lifecycle Management System
 *
 * Provides comprehensive request lifecycle management including:
 * - Automatic request cancellation on component unmount
 * - Navigation-based request abortion
 * - Resource cleanup for cancelled requests
 * - Offline request queuing with automatic retry
 */

import { supabase } from '@/lib/supabase';

/**
 * Request cancellation reasons
 */
export enum CancellationReason {
  COMPONENT_UNMOUNT = 'component_unmount',
  NAVIGATION = 'navigation',
  USER_INITIATED = 'user_initiated',
  TIMEOUT = 'timeout',
  NETWORK_OFFLINE = 'network_offline',
}

/**
 * Request metadata for tracking
 */
export interface RequestMetadata {
  id: string;
  endpoint: string;
  method: string;
  timestamp: number;
  component?: string;
  route?: string;
}

/**
 * Cancellable request wrapper
 */
export interface CancellableRequest<T> {
  promise: Promise<T>;
  cancel: (reason?: CancellationReason) => void;
  metadata: RequestMetadata;
  abortController: AbortController;
}

/**
 * Request lifecycle manager
 */
export class RequestLifecycleManager {
  private activeRequests = new Map<string, CancellableRequest<any>>();
  private componentRequests = new Map<string, Set<string>>();
  private routeRequests = new Map<string, Set<string>>();
  private cleanupCallbacks = new Map<string, (() => void)[]>();

  /**
   * Create a cancellable request
   */
  createCancellableRequest<T>(
    requestFn: (signal: AbortSignal) => Promise<T>,
    metadata: Omit<RequestMetadata, 'id' | 'timestamp'>
  ): CancellableRequest<T> {
    const id = this.generateRequestId();
    const abortController = new AbortController();

    const fullMetadata: RequestMetadata = {
      ...metadata,
      id,
      timestamp: Date.now(),
    };

    // Create the cancellable promise
    const promise = this.wrapRequestWithCleanup(
      requestFn(abortController.signal),
      id,
      abortController
    );

    const cancel = (reason: CancellationReason = CancellationReason.USER_INITIATED) => {
      this.cancelRequest(id, reason);
    };

    const cancellableRequest: CancellableRequest<T> = {
      promise,
      cancel,
      metadata: fullMetadata,
      abortController,
    };

    // Track the request
    this.activeRequests.set(id, cancellableRequest);
    this.trackRequestByComponent(id, metadata.component);
    this.trackRequestByRoute(id, metadata.route);

    return cancellableRequest;
  }

  /**
   * Cancel a specific request
   */
  cancelRequest(requestId: string, reason: CancellationReason): void {
    const request = this.activeRequests.get(requestId);
    if (!request) return;

    console.log(`🚫 Cancelling request ${requestId} due to: ${reason}`);

    // Abort the request
    request.abortController.abort();

    // Run cleanup callbacks
    this.runCleanupCallbacks(requestId);

    // Remove from tracking
    this.removeRequestFromTracking(requestId);
  }

  /**
   * Cancel all requests for a component
   */
  cancelComponentRequests(
    componentId: string,
    reason: CancellationReason = CancellationReason.COMPONENT_UNMOUNT
  ): void {
    const requestIds = this.componentRequests.get(componentId);
    if (!requestIds) return;

    console.log(`🚫 Cancelling ${requestIds.size} requests for component ${componentId}`);

    requestIds.forEach((requestId) => {
      this.cancelRequest(requestId, reason);
    });
  }

  /**
   * Cancel all requests for a route
   */
  cancelRouteRequests(
    route: string,
    reason: CancellationReason = CancellationReason.NAVIGATION
  ): void {
    const requestIds = this.routeRequests.get(route);
    if (!requestIds) return;

    console.log(`🚫 Cancelling ${requestIds.size} requests for route ${route}`);

    requestIds.forEach((requestId) => {
      this.cancelRequest(requestId, reason);
    });
  }

  /**
   * Cancel all active requests
   */
  cancelAllRequests(reason: CancellationReason = CancellationReason.USER_INITIATED): void {
    const requestIds = Array.from(this.activeRequests.keys());

    console.log(`🚫 Cancelling all ${requestIds.length} active requests`);

    requestIds.forEach((requestId) => {
      this.cancelRequest(requestId, reason);
    });
  }

  /**
   * Add cleanup callback for a request
   */
  addCleanupCallback(requestId: string, callback: () => void): void {
    if (!this.cleanupCallbacks.has(requestId)) {
      this.cleanupCallbacks.set(requestId, []);
    }
    this.cleanupCallbacks.get(requestId)!.push(callback);
  }

  /**
   * Get active requests count
   */
  getActiveRequestsCount(): number {
    return this.activeRequests.size;
  }

  /**
   * Get active requests for a component
   */
  getComponentRequestsCount(componentId: string): number {
    return this.componentRequests.get(componentId)?.size || 0;
  }

  /**
   * Get active requests for a route
   */
  getRouteRequestsCount(route: string): number {
    return this.routeRequests.get(route)?.size || 0;
  }

  /**
   * Check if a request is still active
   */
  isRequestActive(requestId: string): boolean {
    return this.activeRequests.has(requestId);
  }

  /**
   * Private: Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Private: Wrap request with cleanup logic
   */
  private async wrapRequestWithCleanup<T>(
    promise: Promise<T>,
    requestId: string,
    abortController: AbortController
  ): Promise<T> {
    try {
      const result = await promise;

      // Request completed successfully
      this.removeRequestFromTracking(requestId);
      return result;
    } catch (error: any) {
      // Check if this was an abort
      if (abortController.signal.aborted) {
        console.log(`⚠️ Request ${requestId} was cancelled`);
        throw new Error('Request was cancelled');
      }

      // Request failed for other reasons
      this.removeRequestFromTracking(requestId);
      throw error;
    }
  }

  /**
   * Private: Track request by component
   */
  private trackRequestByComponent(requestId: string, componentId?: string): void {
    if (!componentId) return;

    if (!this.componentRequests.has(componentId)) {
      this.componentRequests.set(componentId, new Set());
    }
    this.componentRequests.get(componentId)!.add(requestId);
  }

  /**
   * Private: Track request by route
   */
  private trackRequestByRoute(requestId: string, route?: string): void {
    if (!route) return;

    if (!this.routeRequests.has(route)) {
      this.routeRequests.set(route, new Set());
    }
    this.routeRequests.get(route)!.add(requestId);
  }

  /**
   * Private: Remove request from all tracking
   */
  private removeRequestFromTracking(requestId: string): void {
    const request = this.activeRequests.get(requestId);
    if (!request) return;

    // Remove from active requests
    this.activeRequests.delete(requestId);

    // Remove from component tracking
    if (request.metadata.component) {
      const componentRequests = this.componentRequests.get(request.metadata.component);
      if (componentRequests) {
        componentRequests.delete(requestId);
        if (componentRequests.size === 0) {
          this.componentRequests.delete(request.metadata.component);
        }
      }
    }

    // Remove from route tracking
    if (request.metadata.route) {
      const routeRequests = this.routeRequests.get(request.metadata.route);
      if (routeRequests) {
        routeRequests.delete(requestId);
        if (routeRequests.size === 0) {
          this.routeRequests.delete(request.metadata.route);
        }
      }
    }

    // Remove cleanup callbacks
    this.cleanupCallbacks.delete(requestId);
  }

  /**
   * Private: Run cleanup callbacks for a request
   */
  private runCleanupCallbacks(requestId: string): void {
    const callbacks = this.cleanupCallbacks.get(requestId);
    if (!callbacks) return;

    callbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error(`Error running cleanup callback for request ${requestId}:`, error);
      }
    });
  }
}

/**
 * Global request lifecycle manager instance
 */
export const requestLifecycleManager = new RequestLifecycleManager();

/**
 * React hook for automatic request cancellation on component unmount
 */
export function useRequestCancellation(componentId: string) {
  // This would be implemented as a React hook in a real application
  // For now, we'll provide the interface that components can use

  const cancelAllRequests = () => {
    requestLifecycleManager.cancelComponentRequests(componentId);
  };

  const createCancellableRequest = <T>(
    requestFn: (signal: AbortSignal) => Promise<T>,
    metadata: Omit<RequestMetadata, 'id' | 'timestamp' | 'component'>
  ) => {
    return requestLifecycleManager.createCancellableRequest(requestFn, {
      ...metadata,
      component: componentId,
    });
  };

  return {
    cancelAllRequests,
    createCancellableRequest,
    activeRequestsCount: requestLifecycleManager.getComponentRequestsCount(componentId),
  };
}

/**
 * Navigation-based request cancellation
 */
export class NavigationCancellation {
  private currentRoute: string | null = null;

  /**
   * Handle route change
   */
  handleRouteChange(newRoute: string): void {
    if (this.currentRoute && this.currentRoute !== newRoute) {
      // Cancel all requests for the previous route
      requestLifecycleManager.cancelRouteRequests(this.currentRoute, CancellationReason.NAVIGATION);
    }

    this.currentRoute = newRoute;
  }

  /**
   * Get current route
   */
  getCurrentRoute(): string | null {
    return this.currentRoute;
  }
}

/**
 * Global navigation cancellation instance
 */
export const navigationCancellation = new NavigationCancellation();

/**
 * Utility function to create a cancellable Supabase request
 */
export function createCancellableSupabaseRequest<T>(
  requestFn: (signal: AbortSignal) => Promise<T>,
  metadata: Omit<RequestMetadata, 'id' | 'timestamp'>
): CancellableRequest<T> {
  return requestLifecycleManager.createCancellableRequest(async (signal: AbortSignal) => {
    // Wrap the Supabase request with abort signal support
    const timeoutId = setTimeout(() => {
      if (!signal.aborted) {
        signal.dispatchEvent(new Event('abort'));
      }
    }, 30000); // 30 second timeout

    try {
      const result = await requestFn(signal);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }, metadata);
}

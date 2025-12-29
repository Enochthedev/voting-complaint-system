/**
 * Request Lifecycle Management Integration Examples
 *
 * Demonstrates how to integrate request lifecycle management
 * with existing API patterns and React components.
 */

import { supabase } from '@/lib/supabase';
import {
  requestManager,
  useRequestManager,
  setupNavigationCancellation,
  type RequestOptions,
} from '../request-manager';
import {
  requestLifecycleManager,
  useRequestCancellation,
  CancellationReason,
} from '../request-lifecycle';
import { offlineRequestQueue, RequestPriority } from '../offline-queue';

/**
 * Example: Enhanced API wrapper with lifecycle management
 */
export class EnhancedComplaintsAPI {
  /**
   * Fetch complaints with automatic cancellation and offline support
   */
  static async getComplaints(userId: string, options: RequestOptions = {}) {
    return requestManager.executeSupabaseQuery(
      (client) =>
        client
          .from('complaints')
          .select(
            `
          id,
          title,
          description,
          status,
          priority,
          category,
          is_anonymous,
          created_at,
          updated_at,
          assigned_to,
          assigned_user:users!complaints_assigned_to_fkey(id, full_name)
        `
          )
          .eq('student_id', userId)
          .eq('is_draft', false)
          .order('created_at', { ascending: false }),
      {
        endpoint: 'complaints',
        method: 'GET',
        data: { userId },
      },
      {
        priority: RequestPriority.HIGH,
        offlineSupport: true,
        cancellable: true,
        ...options,
      }
    );
  }

  /**
   * Create complaint with offline queuing
   */
  static async createComplaint(complaintData: any, options: RequestOptions = {}) {
    return requestManager.executeSupabaseQuery(
      (client) => client.from('complaints').insert(complaintData).select().single(),
      {
        endpoint: 'complaints',
        method: 'POST',
        data: complaintData,
      },
      {
        priority: RequestPriority.HIGH,
        offlineSupport: true,
        cancellable: false, // Don't cancel creation requests
        ...options,
      }
    );
  }

  /**
   * Update complaint with lifecycle management
   */
  static async updateComplaint(id: string, updates: any, options: RequestOptions = {}) {
    return requestManager.executeSupabaseQuery(
      (client) => client.from('complaints').update(updates).eq('id', id).select().single(),
      {
        endpoint: 'complaints',
        method: 'PUT',
        data: { id, ...updates },
      },
      {
        priority: RequestPriority.NORMAL,
        offlineSupport: true,
        cancellable: true,
        ...options,
      }
    );
  }
}

/**
 * Example: React component integration (TypeScript interface)
 */
export interface ComplaintListComponentProps {
  userId: string;
  route: string;
}

/**
 * Example component logic using request lifecycle management
 */
export class ComplaintListComponent {
  private componentId: string;
  private route: string;
  private requestManager: ReturnType<typeof useRequestManager>;

  constructor(props: ComplaintListComponentProps) {
    this.componentId = `complaint-list-${Date.now()}`;
    this.route = props.route;
    this.requestManager = useRequestManager(this.componentId, this.route);
  }

  /**
   * Load complaints with automatic cancellation
   */
  async loadComplaints(userId: string) {
    const result = await this.requestManager.get('complaints', {
      priority: RequestPriority.HIGH,
    });

    if (result.queued) {
      console.log('Request queued for offline execution');
      return null;
    }

    if (result.cancelled) {
      console.log('Request was cancelled');
      return null;
    }

    if (result.error) {
      console.error('Failed to load complaints:', result.error);
      throw result.error;
    }

    return result.data;
  }

  /**
   * Create complaint with offline support
   */
  async createComplaint(complaintData: any) {
    const result = await this.requestManager.post('complaints', complaintData, {
      priority: RequestPriority.HIGH,
      cancellable: false, // Don't cancel creation
    });

    if (result.queued) {
      // Show user that request will be processed when online
      return { queued: true, requestId: result.requestId };
    }

    if (result.error) {
      throw result.error;
    }

    return result.data;
  }

  /**
   * Component cleanup - cancel all requests
   */
  cleanup() {
    this.requestManager.cancelAllRequests();
  }
}

/**
 * Example: Navigation integration
 */
export class NavigationManager {
  private navigationCancellation = setupNavigationCancellation();

  /**
   * Handle route changes with automatic request cancellation
   */
  handleRouteChange(newRoute: string, oldRoute?: string) {
    console.log(`🧭 Navigating from ${oldRoute} to ${newRoute}`);

    // Cancel requests for the old route
    if (oldRoute) {
      requestManager.cancelRouteRequests(oldRoute);
    }

    // Update navigation state
    this.navigationCancellation.handleRouteChange(newRoute);
  }

  /**
   * Get navigation statistics
   */
  getNavigationStats() {
    return requestManager.getRequestStats();
  }
}

/**
 * Example: Offline queue management
 */
export class OfflineManager {
  /**
   * Monitor network status and queue processing
   */
  setupOfflineMonitoring() {
    const unsubscribe = requestManager.addNetworkStatusListener((online) => {
      if (online) {
        console.log('📡 Back online - processing queued requests');
        this.processQueuedRequests();
      } else {
        console.log('📱 Gone offline - requests will be queued');
      }
    });

    return unsubscribe;
  }

  /**
   * Process queued requests manually
   */
  async processQueuedRequests() {
    const result = await requestManager.processOfflineQueue();

    console.log(`✅ Processed ${result.processed} queued requests:`);
    console.log(`  - Successful: ${result.successful}`);
    console.log(`  - Failed: ${result.failed}`);
    console.log(`  - Cancelled: ${result.cancelled}`);

    if (result.errors.length > 0) {
      console.error('Errors during queue processing:', result.errors);
    }

    return result;
  }

  /**
   * Get offline queue status
   */
  getQueueStatus() {
    return requestManager.getRequestStats();
  }

  /**
   * Clear offline queue
   */
  clearQueue() {
    requestManager.clearOfflineQueue();
  }
}

/**
 * Example: Advanced request patterns
 */
export class AdvancedRequestPatterns {
  /**
   * Batch requests with individual cancellation
   */
  async batchRequestsWithCancellation(
    requests: Array<{
      endpoint: string;
      method: string;
      data?: any;
      component?: string;
    }>
  ) {
    const cancellableRequests = requests.map((req) =>
      requestLifecycleManager.createCancellableRequest(
        async (signal) => {
          // Simulate API call
          const response = await fetch(`/api/${req.endpoint}`, {
            method: req.method,
            body: req.data ? JSON.stringify(req.data) : undefined,
            signal,
          });
          return response.json();
        },
        {
          endpoint: req.endpoint,
          method: req.method,
          component: req.component,
        }
      )
    );

    // Execute all requests concurrently
    const results = await Promise.allSettled(cancellableRequests.map((req) => req.promise));

    return results.map((result, index) => ({
      requestId: cancellableRequests[index].metadata.id,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null,
    }));
  }

  /**
   * Priority-based request execution
   */
  async executePriorityRequests(
    criticalRequests: Array<() => Promise<any>>,
    normalRequests: Array<() => Promise<any>>
  ) {
    // Execute critical requests first
    const criticalResults = await Promise.allSettled(
      criticalRequests.map((req) =>
        requestManager.executeRequest(
          req,
          { endpoint: 'critical', method: 'POST' },
          { priority: RequestPriority.CRITICAL, cancellable: false }
        )
      )
    );

    // Then execute normal requests
    const normalResults = await Promise.allSettled(
      normalRequests.map((req) =>
        requestManager.executeRequest(
          req,
          { endpoint: 'normal', method: 'GET' },
          { priority: RequestPriority.NORMAL, cancellable: true }
        )
      )
    );

    return {
      critical: criticalResults,
      normal: normalResults,
    };
  }
}

/**
 * Example: Error handling with lifecycle management
 */
export class ErrorHandlingExamples {
  /**
   * Handle request cancellation gracefully
   */
  async handleCancellableRequest<T>(
    requestFn: () => Promise<T>,
    onCancel?: () => void
  ): Promise<T | null> {
    try {
      const result = await requestManager.executeRequest(
        requestFn,
        { endpoint: 'example', method: 'GET' },
        { cancellable: true }
      );

      if (result.cancelled) {
        onCancel?.();
        return null;
      }

      if (result.error) {
        throw result.error;
      }

      return result.data || null;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  /**
   * Handle offline scenarios
   */
  async handleOfflineRequest<T>(requestFn: () => Promise<T>, fallbackData?: T): Promise<T | null> {
    const result = await requestManager.executeRequest(
      requestFn,
      { endpoint: 'example', method: 'GET' },
      { offlineSupport: true }
    );

    if (result.queued) {
      console.log('Request queued for offline execution');
      return fallbackData || null;
    }

    if (result.error) {
      console.error('Request failed:', result.error);
      return fallbackData || null;
    }

    return result.data || null;
  }
}

/**
 * Export all examples for documentation and testing
 */
export const examples = {
  EnhancedComplaintsAPI,
  ComplaintListComponent,
  NavigationManager,
  OfflineManager,
  AdvancedRequestPatterns,
  ErrorHandlingExamples,
};

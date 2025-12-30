/**
 * Offline Request Queuing System
 *
 * Provides offline request queuing with:
 * - Network status detection and monitoring
 * - Request queue for offline scenarios
 * - Automatic queue execution on reconnection
 * - Persistent storage for queue durability
 */

import { supabase } from '@/lib/supabase';
import { requestLifecycleManager, CancellationReason } from './request-lifecycle';
import type { RequestMetadata } from './request-lifecycle';

/**
 * Queued request status
 */
export enum QueuedRequestStatus {
  PENDING = 'pending',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Queued request priority
 */
export enum RequestPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4,
}

/**
 * Serializable request data
 */
export interface SerializableRequest {
  id: string;
  endpoint: string;
  method: string;
  data?: any;
  headers?: Record<string, string>;
  priority: RequestPriority;
  maxRetries: number;
  retryCount: number;
  createdAt: number;
  lastAttempt?: number;
  status: QueuedRequestStatus;
  metadata: RequestMetadata;
}

/**
 * Network status
 */
export interface NetworkStatus {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  lastChanged: number;
}

/**
 * Queue execution result
 */
export interface QueueExecutionResult {
  processed: number;
  successful: number;
  failed: number;
  cancelled: number;
  errors: Array<{ requestId: string; error: string }>;
}

/**
 * Offline request queue manager
 */
export class OfflineRequestQueue {
  private queue: Map<string, SerializableRequest> = new Map();
  private isProcessing = false;
  private networkStatus: NetworkStatus = {
    online: navigator.onLine,
    lastChanged: Date.now(),
  };
  private listeners: Set<(status: NetworkStatus) => void> = new Set();
  private storageKey = 'offline_request_queue';
  private maxQueueSize = 100;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeNetworkMonitoring();
    this.loadQueueFromStorage();
    this.startPeriodicProcessing();
  }

  /**
   * Add request to queue
   */
  enqueueRequest(
    endpoint: string,
    method: string,
    data?: any,
    options: {
      priority?: RequestPriority;
      maxRetries?: number;
      headers?: Record<string, string>;
      metadata?: Partial<RequestMetadata>;
    } = {}
  ): string {
    const id = this.generateRequestId();
    const now = Date.now();

    const queuedRequest: SerializableRequest = {
      id,
      endpoint,
      method: method.toUpperCase(),
      data,
      headers: options.headers || {},
      priority: options.priority || RequestPriority.NORMAL,
      maxRetries: options.maxRetries || 3,
      retryCount: 0,
      createdAt: now,
      status: QueuedRequestStatus.PENDING,
      metadata: {
        id,
        endpoint,
        method: method.toUpperCase(),
        timestamp: now,
        ...options.metadata,
      },
    };

    // Check queue size limit
    if (this.queue.size >= this.maxQueueSize) {
      this.removeOldestLowPriorityRequest();
    }

    this.queue.set(id, queuedRequest);
    this.saveQueueToStorage();

    console.log(`📥 Queued ${method.toUpperCase()} request to ${endpoint} (ID: ${id})`);

    // Try to process immediately if online
    if (this.networkStatus.online) {
      this.processQueue();
    }

    return id;
  }

  /**
   * Remove request from queue
   */
  dequeueRequest(requestId: string): boolean {
    const request = this.queue.get(requestId);
    if (!request) return false;

    this.queue.delete(requestId);
    this.saveQueueToStorage();

    console.log(`📤 Removed request ${requestId} from queue`);
    return true;
  }

  /**
   * Cancel queued request
   */
  cancelRequest(requestId: string): boolean {
    const request = this.queue.get(requestId);
    if (!request) return false;

    if (request.status === QueuedRequestStatus.EXECUTING) {
      // Cannot cancel executing request, but mark for cancellation
      request.status = QueuedRequestStatus.CANCELLED;
      this.saveQueueToStorage();
      return true;
    }

    request.status = QueuedRequestStatus.CANCELLED;
    this.saveQueueToStorage();

    console.log(`❌ Cancelled queued request ${requestId}`);
    return true;
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    total: number;
    pending: number;
    executing: number;
    failed: number;
    cancelled: number;
  } {
    const requests = Array.from(this.queue.values());

    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === QueuedRequestStatus.PENDING).length,
      executing: requests.filter((r) => r.status === QueuedRequestStatus.EXECUTING).length,
      failed: requests.filter((r) => r.status === QueuedRequestStatus.FAILED).length,
      cancelled: requests.filter((r) => r.status === QueuedRequestStatus.CANCELLED).length,
    };
  }

  /**
   * Get network status
   */
  getNetworkStatus(): NetworkStatus {
    return { ...this.networkStatus };
  }

  /**
   * Add network status listener
   */
  addNetworkStatusListener(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Process the queue
   */
  async processQueue(): Promise<QueueExecutionResult> {
    if (this.isProcessing || !this.networkStatus.online) {
      return {
        processed: 0,
        successful: 0,
        failed: 0,
        cancelled: 0,
        errors: [],
      };
    }

    this.isProcessing = true;
    console.log('🔄 Processing offline request queue...');

    const result: QueueExecutionResult = {
      processed: 0,
      successful: 0,
      failed: 0,
      cancelled: 0,
      errors: [],
    };

    try {
      // Get pending requests sorted by priority and creation time
      const pendingRequests = Array.from(this.queue.values())
        .filter((r) => r.status === QueuedRequestStatus.PENDING)
        .sort((a, b) => {
          // Sort by priority first (higher priority first)
          if (a.priority !== b.priority) {
            return b.priority - a.priority;
          }
          // Then by creation time (older first)
          return a.createdAt - b.createdAt;
        });

      for (const request of pendingRequests) {
        if (!this.networkStatus.online) {
          console.log('📡 Network went offline, stopping queue processing');
          break;
        }

        result.processed++;

        try {
          await this.executeRequest(request);
          result.successful++;

          // Remove completed request from queue
          this.queue.delete(request.id);
        } catch (error: any) {
          console.error(`Failed to execute queued request ${request.id}:`, error);

          request.retryCount++;
          request.lastAttempt = Date.now();

          if (request.retryCount >= request.maxRetries) {
            request.status = QueuedRequestStatus.FAILED;
            result.failed++;
            result.errors.push({
              requestId: request.id,
              error: error.message || 'Unknown error',
            });
          } else {
            // Reset to pending for retry
            request.status = QueuedRequestStatus.PENDING;
          }
        }
      }

      // Clean up completed and old failed requests
      this.cleanupQueue();
      this.saveQueueToStorage();
    } finally {
      this.isProcessing = false;
    }

    console.log(
      `✅ Queue processing complete: ${result.successful}/${result.processed} successful`
    );
    return result;
  }

  /**
   * Clear the entire queue
   */
  clearQueue(): void {
    this.queue.clear();
    this.saveQueueToStorage();
    console.log('🗑️ Cleared offline request queue');
  }

  /**
   * Get queued requests
   */
  getQueuedRequests(): SerializableRequest[] {
    return Array.from(this.queue.values());
  }

  /**
   * Private: Initialize network monitoring
   */
  private initializeNetworkMonitoring(): void {
    // Basic online/offline detection
    window.addEventListener('online', () => {
      this.updateNetworkStatus({ online: true });
    });

    window.addEventListener('offline', () => {
      this.updateNetworkStatus({ online: false });
    });

    // Enhanced network information if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;

      const updateConnectionInfo = () => {
        this.updateNetworkStatus({
          online: navigator.onLine,
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
        });
      };

      connection.addEventListener('change', updateConnectionInfo);
      updateConnectionInfo();
    }
  }

  /**
   * Private: Update network status
   */
  private updateNetworkStatus(updates: Partial<NetworkStatus>): void {
    const wasOnline = this.networkStatus.online;

    this.networkStatus = {
      ...this.networkStatus,
      ...updates,
      lastChanged: Date.now(),
    };

    console.log(`📡 Network status: ${this.networkStatus.online ? 'Online' : 'Offline'}`);

    // Notify listeners
    this.listeners.forEach((listener) => {
      try {
        listener(this.networkStatus);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });

    // If we just came back online, process the queue
    if (!wasOnline && this.networkStatus.online) {
      console.log('🔄 Network reconnected, processing queued requests...');
      setTimeout(() => this.processQueue(), 1000); // Small delay to ensure connection is stable
    }
  }

  /**
   * Private: Execute a queued request
   */
  private async executeRequest(request: SerializableRequest): Promise<any> {
    request.status = QueuedRequestStatus.EXECUTING;
    this.saveQueueToStorage();

    console.log(`🚀 Executing queued ${request.method} request to ${request.endpoint}`);

    // Create a cancellable request
    const cancellableRequest = requestLifecycleManager.createCancellableRequest(
      async (signal: AbortSignal) => {
        // Build the Supabase request based on the queued request
        let query: any = supabase.from(this.extractTableFromEndpoint(request.endpoint));

        switch (request.method) {
          case 'GET':
            if (request.data?.select) {
              query = query.select(request.data.select);
            }
            if (request.data?.filters) {
              Object.entries(request.data.filters).forEach(([key, value]) => {
                query = query.eq(key, value);
              });
            }
            break;

          case 'POST':
            query = query.insert(request.data);
            break;

          case 'PUT':
          case 'PATCH':
            if (request.data?.id) {
              const { id, ...updateData } = request.data;
              query = query.update(updateData).eq('id', id);
            }
            break;

          case 'DELETE':
            if (request.data?.id) {
              query = query.delete().eq('id', request.data.id);
            }
            break;

          default:
            throw new Error(`Unsupported method: ${request.method}`);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        return data;
      },
      request.metadata
    );

    try {
      const result = await cancellableRequest.promise;
      request.status = QueuedRequestStatus.COMPLETED;
      return result;
    } catch (error) {
      request.status = QueuedRequestStatus.FAILED;
      throw error;
    }
  }

  /**
   * Private: Extract table name from endpoint
   */
  private extractTableFromEndpoint(endpoint: string): string {
    // Simple extraction - in a real app this would be more sophisticated
    const parts = endpoint.split('/').filter(Boolean);
    return parts[parts.length - 1] || 'complaints';
  }

  /**
   * Private: Generate unique request ID
   */
  private generateRequestId(): string {
    return `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Private: Save queue to localStorage
   */
  private saveQueueToStorage(): void {
    try {
      const queueData = Array.from(this.queue.entries());
      localStorage.setItem(this.storageKey, JSON.stringify(queueData));
    } catch (error) {
      console.error('Failed to save queue to storage:', error);
    }
  }

  /**
   * Private: Load queue from localStorage
   */
  private loadQueueFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const queueData = JSON.parse(stored);
        this.queue = new Map(queueData);

        // Reset executing requests to pending on app restart
        this.queue.forEach((request) => {
          if (request.status === QueuedRequestStatus.EXECUTING) {
            request.status = QueuedRequestStatus.PENDING;
          }
        });

        console.log(`📂 Loaded ${this.queue.size} requests from storage`);
      }
    } catch (error) {
      console.error('Failed to load queue from storage:', error);
      this.queue.clear();
    }
  }

  /**
   * Private: Remove oldest low priority request to make room
   */
  private removeOldestLowPriorityRequest(): void {
    const lowPriorityRequests = Array.from(this.queue.values())
      .filter((r) => r.priority === RequestPriority.LOW)
      .sort((a, b) => a.createdAt - b.createdAt);

    if (lowPriorityRequests.length > 0) {
      this.queue.delete(lowPriorityRequests[0].id);
      console.log(`🗑️ Removed oldest low priority request to make room`);
    }
  }

  /**
   * Private: Clean up old completed and failed requests
   */
  private cleanupQueue(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    const toRemove: string[] = [];

    this.queue.forEach((request, id) => {
      const age = now - request.createdAt;

      if (
        age > maxAge &&
        (request.status === QueuedRequestStatus.COMPLETED ||
          request.status === QueuedRequestStatus.FAILED ||
          request.status === QueuedRequestStatus.CANCELLED)
      ) {
        toRemove.push(id);
      }
    });

    toRemove.forEach((id) => {
      this.queue.delete(id);
    });

    if (toRemove.length > 0) {
      console.log(`🧹 Cleaned up ${toRemove.length} old requests from queue`);
    }
  }

  /**
   * Private: Start periodic queue processing
   */
  private startPeriodicProcessing(): void {
    // Process queue every 30 seconds when online
    this.processingInterval = setInterval(() => {
      if (this.networkStatus.online && this.queue.size > 0) {
        this.processQueue();
      }
    }, 30000);
  }

  /**
   * Cleanup method for when the queue manager is no longer needed
   */
  destroy(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    this.listeners.clear();
    this.saveQueueToStorage();
  }
}

/**
 * Global offline request queue instance
 */
export const offlineRequestQueue = new OfflineRequestQueue();

/**
 * Utility function to enqueue a request when offline
 */
export function enqueueOfflineRequest(
  endpoint: string,
  method: string,
  data?: any,
  options?: {
    priority?: RequestPriority;
    maxRetries?: number;
    headers?: Record<string, string>;
    metadata?: Partial<RequestMetadata>;
  }
): string {
  return offlineRequestQueue.enqueueRequest(endpoint, method, data, options);
}

/**
 * Utility function to check if we should queue a request
 */
export function shouldQueueRequest(): boolean {
  return !navigator.onLine;
}

/**
 * Enhanced API wrapper that automatically queues requests when offline
 */
export async function withOfflineSupport<T>(
  requestFn: () => Promise<T>,
  fallbackData: {
    endpoint: string;
    method: string;
    data?: any;
    priority?: RequestPriority;
    metadata?: Partial<RequestMetadata>;
  }
): Promise<T> {
  if (shouldQueueRequest()) {
    // Queue the request for later execution
    const requestId = enqueueOfflineRequest(
      fallbackData.endpoint,
      fallbackData.method,
      fallbackData.data,
      {
        priority: fallbackData.priority,
        metadata: fallbackData.metadata,
      }
    );

    console.log(`📱 Offline: Queued request ${requestId} for later execution`);

    // Return a rejected promise with a specific offline error
    throw new Error('Request queued for offline execution');
  }

  // Execute normally when online
  return requestFn();
}

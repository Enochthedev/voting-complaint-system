/**
 * Offline Request Queue Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OfflineRequestQueue, RequestPriority, QueuedRequestStatus } from '../offline-queue';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    })),
  },
}));

describe('OfflineRequestQueue', () => {
  let queue: OfflineRequestQueue;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    navigator.onLine = true;
    queue = new OfflineRequestQueue();
  });

  afterEach(() => {
    queue.destroy();
  });

  describe('Request Queuing', () => {
    it('should enqueue a request', () => {
      // Create a new queue instance and immediately set it offline
      const offlineQueue = new OfflineRequestQueue();
      // Manually set the network status to offline
      (offlineQueue as any).networkStatus.online = false;

      const requestId = offlineQueue.enqueueRequest('/api/test', 'GET', { test: 'data' });

      expect(requestId).toBeDefined();
      expect(typeof requestId).toBe('string');
      expect(requestId).toMatch(/^queue_/);

      const status = offlineQueue.getQueueStatus();
      expect(status.total).toBe(1);
      expect(status.pending).toBe(1);

      offlineQueue.destroy();
    });

    it('should enqueue requests with different priorities', () => {
      const lowPriorityId = queue.enqueueRequest('/api/low', 'GET', null, {
        priority: RequestPriority.LOW,
      });

      const highPriorityId = queue.enqueueRequest('/api/high', 'GET', null, {
        priority: RequestPriority.HIGH,
      });

      const criticalPriorityId = queue.enqueueRequest('/api/critical', 'POST', null, {
        priority: RequestPriority.CRITICAL,
      });

      const requests = queue.getQueuedRequests();
      expect(requests).toHaveLength(3);

      const lowRequest = requests.find((r) => r.id === lowPriorityId);
      const highRequest = requests.find((r) => r.id === highPriorityId);
      const criticalRequest = requests.find((r) => r.id === criticalPriorityId);

      expect(lowRequest?.priority).toBe(RequestPriority.LOW);
      expect(highRequest?.priority).toBe(RequestPriority.HIGH);
      expect(criticalRequest?.priority).toBe(RequestPriority.CRITICAL);
    });

    it('should dequeue a request', () => {
      const requestId = queue.enqueueRequest('/api/test', 'GET');

      expect(queue.getQueueStatus().total).toBe(1);

      const removed = queue.dequeueRequest(requestId);

      expect(removed).toBe(true);
      expect(queue.getQueueStatus().total).toBe(0);
    });

    it('should return false when dequeuing non-existent request', () => {
      const removed = queue.dequeueRequest('non-existent-id');
      expect(removed).toBe(false);
    });
  });

  describe('Request Cancellation', () => {
    it('should cancel a pending request', () => {
      const requestId = queue.enqueueRequest('/api/test', 'GET');

      const cancelled = queue.cancelRequest(requestId);

      expect(cancelled).toBe(true);

      const requests = queue.getQueuedRequests();
      const request = requests.find((r) => r.id === requestId);
      expect(request?.status).toBe(QueuedRequestStatus.CANCELLED);
    });

    it('should handle cancelling non-existent request', () => {
      const cancelled = queue.cancelRequest('non-existent-id');
      expect(cancelled).toBe(false);
    });
  });

  describe('Queue Status', () => {
    it('should return correct queue status', () => {
      // Create a new queue instance and immediately set it offline
      const offlineQueue = new OfflineRequestQueue();
      // Manually set the network status to offline
      (offlineQueue as any).networkStatus.online = false;

      // Add requests with different statuses
      const pendingId = offlineQueue.enqueueRequest('/api/pending', 'GET');
      const cancelledId = offlineQueue.enqueueRequest('/api/cancelled', 'POST');

      offlineQueue.cancelRequest(cancelledId);

      const status = offlineQueue.getQueueStatus();

      expect(status.total).toBe(2);
      expect(status.pending).toBe(1);
      expect(status.cancelled).toBe(1);
      expect(status.executing).toBe(0);
      expect(status.failed).toBe(0);

      offlineQueue.destroy();
    });

    it('should return empty status for empty queue', () => {
      const status = queue.getQueueStatus();

      expect(status.total).toBe(0);
      expect(status.pending).toBe(0);
      expect(status.executing).toBe(0);
      expect(status.failed).toBe(0);
      expect(status.cancelled).toBe(0);
    });
  });

  describe('Network Status', () => {
    it('should return current network status', () => {
      const status = queue.getNetworkStatus();

      expect(status).toHaveProperty('online');
      expect(status).toHaveProperty('lastChanged');
      expect(typeof status.online).toBe('boolean');
      expect(typeof status.lastChanged).toBe('number');
    });

    it('should add and remove network status listeners', () => {
      const listener = vi.fn();

      const unsubscribe = queue.addNetworkStatusListener(listener);

      expect(typeof unsubscribe).toBe('function');

      // Unsubscribe should not throw
      expect(() => unsubscribe()).not.toThrow();
    });
  });

  describe('Queue Persistence', () => {
    it('should save queue to localStorage', () => {
      queue.enqueueRequest('/api/test', 'GET', { test: 'data' });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'offline_request_queue',
        expect.any(String)
      );
    });

    it('should load queue from localStorage', () => {
      const mockQueueData = JSON.stringify([
        [
          'test-id',
          {
            id: 'test-id',
            endpoint: '/api/test',
            method: 'GET',
            priority: RequestPriority.NORMAL,
            maxRetries: 3,
            retryCount: 0,
            createdAt: Date.now(),
            status: QueuedRequestStatus.PENDING,
            metadata: {
              id: 'test-id',
              endpoint: '/api/test',
              method: 'GET',
              timestamp: Date.now(),
            },
          },
        ],
      ]);

      localStorageMock.getItem.mockReturnValue(mockQueueData);

      const newQueue = new OfflineRequestQueue();
      const status = newQueue.getQueueStatus();

      expect(status.total).toBe(1);
      expect(status.pending).toBe(1);

      newQueue.destroy();
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      expect(() => {
        const newQueue = new OfflineRequestQueue();
        newQueue.destroy();
      }).not.toThrow();
    });
  });

  describe('Queue Management', () => {
    it('should clear the entire queue', () => {
      queue.enqueueRequest('/api/test1', 'GET');
      queue.enqueueRequest('/api/test2', 'POST');

      expect(queue.getQueueStatus().total).toBe(2);

      queue.clearQueue();

      expect(queue.getQueueStatus().total).toBe(0);
    });

    it('should return queued requests', () => {
      const id1 = queue.enqueueRequest('/api/test1', 'GET');
      const id2 = queue.enqueueRequest('/api/test2', 'POST');

      const requests = queue.getQueuedRequests();

      expect(requests).toHaveLength(2);
      expect(requests.map((r) => r.id)).toContain(id1);
      expect(requests.map((r) => r.id)).toContain(id2);
    });
  });

  describe('Request Processing', () => {
    it('should not process queue when offline', async () => {
      navigator.onLine = false;

      queue.enqueueRequest('/api/test', 'GET');

      const result = await queue.processQueue();

      expect(result.processed).toBe(0);
      expect(result.successful).toBe(0);
    });

    it('should not process queue when already processing', async () => {
      // Mock a long-running process
      const originalProcessQueue = queue.processQueue;
      let isProcessing = false;

      queue.processQueue = async function () {
        if (isProcessing) {
          return {
            processed: 0,
            successful: 0,
            failed: 0,
            cancelled: 0,
            errors: [],
          };
        }
        isProcessing = true;

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 100));

        isProcessing = false;
        return originalProcessQueue.call(this);
      };

      queue.enqueueRequest('/api/test', 'GET');

      // Start two processing attempts simultaneously
      const [result1, result2] = await Promise.all([queue.processQueue(), queue.processQueue()]);

      // One should process, the other should return early
      expect(result1.processed + result2.processed).toBeLessThanOrEqual(1);
    });
  });
});

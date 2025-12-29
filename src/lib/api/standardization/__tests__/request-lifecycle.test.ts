/**
 * Request Lifecycle Management Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  RequestLifecycleManager,
  CancellationReason,
  requestLifecycleManager,
} from '../request-lifecycle';

// Mock AbortController for testing
global.AbortController = class MockAbortController {
  signal = {
    aborted: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  abort() {
    this.signal.aborted = true;
  }
} as any;

describe('RequestLifecycleManager', () => {
  let manager: RequestLifecycleManager;

  beforeEach(() => {
    manager = new RequestLifecycleManager();
  });

  afterEach(() => {
    // Clean up any active requests
    manager.cancelAllRequests();
  });

  describe('Request Creation and Tracking', () => {
    it('should create a cancellable request', async () => {
      const mockRequestFn = vi.fn().mockResolvedValue('test result');

      const cancellableRequest = manager.createCancellableRequest(mockRequestFn, {
        endpoint: '/test',
        method: 'GET',
        component: 'test-component',
      });

      expect(cancellableRequest).toHaveProperty('promise');
      expect(cancellableRequest).toHaveProperty('cancel');
      expect(cancellableRequest).toHaveProperty('metadata');
      expect(cancellableRequest).toHaveProperty('abortController');

      expect(cancellableRequest.metadata.endpoint).toBe('/test');
      expect(cancellableRequest.metadata.method).toBe('GET');
      expect(cancellableRequest.metadata.component).toBe('test-component');
    });

    it('should track active requests', () => {
      const mockRequestFn = vi.fn().mockResolvedValue('test result');

      expect(manager.getActiveRequestsCount()).toBe(0);

      const request1 = manager.createCancellableRequest(mockRequestFn, {
        endpoint: '/test1',
        method: 'GET',
      });

      expect(manager.getActiveRequestsCount()).toBe(1);

      const request2 = manager.createCancellableRequest(mockRequestFn, {
        endpoint: '/test2',
        method: 'POST',
      });

      expect(manager.getActiveRequestsCount()).toBe(2);
    });

    it('should track requests by component', () => {
      const mockRequestFn = vi.fn().mockResolvedValue('test result');

      const request1 = manager.createCancellableRequest(mockRequestFn, {
        endpoint: '/test1',
        method: 'GET',
        component: 'component-a',
      });

      const request2 = manager.createCancellableRequest(mockRequestFn, {
        endpoint: '/test2',
        method: 'GET',
        component: 'component-a',
      });

      const request3 = manager.createCancellableRequest(mockRequestFn, {
        endpoint: '/test3',
        method: 'GET',
        component: 'component-b',
      });

      expect(manager.getComponentRequestsCount('component-a')).toBe(2);
      expect(manager.getComponentRequestsCount('component-b')).toBe(1);
      expect(manager.getComponentRequestsCount('component-c')).toBe(0);
    });
  });

  describe('Request Cancellation', () => {
    it('should cancel individual requests', () => {
      const mockRequestFn = vi.fn().mockImplementation(
        (signal: AbortSignal) =>
          new Promise((resolve, reject) => {
            setTimeout(() => {
              if (signal.aborted) {
                reject(new Error('Request was cancelled'));
              } else {
                resolve('test result');
              }
            }, 100);
          })
      );

      const cancellableRequest = manager.createCancellableRequest(mockRequestFn, {
        endpoint: '/test',
        method: 'GET',
      });

      expect(manager.isRequestActive(cancellableRequest.metadata.id)).toBe(true);

      // Cancel the request
      cancellableRequest.cancel(CancellationReason.USER_INITIATED);

      expect(cancellableRequest.abortController.signal.aborted).toBe(true);
    });

    it('should cancel all requests for a component', () => {
      const mockRequestFn = vi.fn().mockResolvedValue('test result');

      const request1 = manager.createCancellableRequest(mockRequestFn, {
        endpoint: '/test1',
        method: 'GET',
        component: 'test-component',
      });

      const request2 = manager.createCancellableRequest(mockRequestFn, {
        endpoint: '/test2',
        method: 'GET',
        component: 'test-component',
      });

      const request3 = manager.createCancellableRequest(mockRequestFn, {
        endpoint: '/test3',
        method: 'GET',
        component: 'other-component',
      });

      expect(manager.getComponentRequestsCount('test-component')).toBe(2);
      expect(manager.getComponentRequestsCount('other-component')).toBe(1);

      // Cancel all requests for test-component
      manager.cancelComponentRequests('test-component');

      expect(manager.getComponentRequestsCount('test-component')).toBe(0);
      expect(manager.getComponentRequestsCount('other-component')).toBe(1);
    });

    it('should cancel all requests for a route', () => {
      const mockRequestFn = vi.fn().mockResolvedValue('test result');

      const request1 = manager.createCancellableRequest(mockRequestFn, {
        endpoint: '/test1',
        method: 'GET',
        route: '/dashboard',
      });

      const request2 = manager.createCancellableRequest(mockRequestFn, {
        endpoint: '/test2',
        method: 'GET',
        route: '/dashboard',
      });

      const request3 = manager.createCancellableRequest(mockRequestFn, {
        endpoint: '/test3',
        method: 'GET',
        route: '/profile',
      });

      expect(manager.getRouteRequestsCount('/dashboard')).toBe(2);
      expect(manager.getRouteRequestsCount('/profile')).toBe(1);

      // Cancel all requests for /dashboard route
      manager.cancelRouteRequests('/dashboard');

      expect(manager.getRouteRequestsCount('/dashboard')).toBe(0);
      expect(manager.getRouteRequestsCount('/profile')).toBe(1);
    });
  });

  describe('Cleanup Callbacks', () => {
    it('should run cleanup callbacks when request is cancelled', () => {
      const mockRequestFn = vi.fn().mockResolvedValue('test result');
      const cleanupCallback = vi.fn();

      const cancellableRequest = manager.createCancellableRequest(mockRequestFn, {
        endpoint: '/test',
        method: 'GET',
      });

      manager.addCleanupCallback(cancellableRequest.metadata.id, cleanupCallback);

      // Cancel the request
      manager.cancelRequest(cancellableRequest.metadata.id, CancellationReason.USER_INITIATED);

      expect(cleanupCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle cleanup callback errors gracefully', () => {
      const mockRequestFn = vi.fn().mockResolvedValue('test result');
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error('Cleanup error');
      });
      const successCallback = vi.fn();

      const cancellableRequest = manager.createCancellableRequest(mockRequestFn, {
        endpoint: '/test',
        method: 'GET',
      });

      manager.addCleanupCallback(cancellableRequest.metadata.id, errorCallback);
      manager.addCleanupCallback(cancellableRequest.metadata.id, successCallback);

      // Cancel the request - should not throw despite callback error
      expect(() => {
        manager.cancelRequest(cancellableRequest.metadata.id, CancellationReason.USER_INITIATED);
      }).not.toThrow();

      expect(errorCallback).toHaveBeenCalledTimes(1);
      expect(successCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Request Completion', () => {
    it('should remove completed requests from tracking', async () => {
      const mockRequestFn = vi.fn().mockResolvedValue('test result');

      const cancellableRequest = manager.createCancellableRequest(mockRequestFn, {
        endpoint: '/test',
        method: 'GET',
      });

      expect(manager.getActiveRequestsCount()).toBe(1);
      expect(manager.isRequestActive(cancellableRequest.metadata.id)).toBe(true);

      // Wait for request to complete
      const result = await cancellableRequest.promise;

      expect(result).toBe('test result');
      expect(manager.getActiveRequestsCount()).toBe(0);
      expect(manager.isRequestActive(cancellableRequest.metadata.id)).toBe(false);
    });

    it('should remove failed requests from tracking', async () => {
      const mockRequestFn = vi.fn().mockRejectedValue(new Error('Request failed'));

      const cancellableRequest = manager.createCancellableRequest(mockRequestFn, {
        endpoint: '/test',
        method: 'GET',
      });

      expect(manager.getActiveRequestsCount()).toBe(1);

      // Wait for request to fail
      try {
        await cancellableRequest.promise;
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      expect(manager.getActiveRequestsCount()).toBe(0);
      expect(manager.isRequestActive(cancellableRequest.metadata.id)).toBe(false);
    });
  });
});

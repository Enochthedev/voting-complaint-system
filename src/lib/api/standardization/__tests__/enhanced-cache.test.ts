/**
 * Tests for enhanced cache management system
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import {
  EnhancedCacheManager,
  globalCacheManager,
  createEnhancedQueryClient,
  CacheInvalidator,
  createCacheInvalidator,
} from '../enhanced-cache';

// Mock localStorage for testing
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('EnhancedCacheManager', () => {
  let cacheManager: EnhancedCacheManager;

  beforeEach(() => {
    cacheManager = new EnhancedCacheManager({
      ttl: 1000,
      maxSize: 10,
      strategy: 'lru',
      persistentStorage: false, // Disable for testing
      intelligentGC: false, // Disable for testing
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cacheManager.destroy();
  });

  describe('createQueryClient', () => {
    it('should create a QueryClient with enhanced options', () => {
      const queryClient = cacheManager.getQueryClient();

      expect(queryClient).toBeInstanceOf(QueryClient);
      expect(queryClient.getDefaultOptions().queries?.networkMode).toBe('offlineFirst');
    });

    it('should apply different stale times based on query type', () => {
      const queryClient = cacheManager.getQueryClient();
      const defaultOptions = queryClient.getDefaultOptions();

      // Mock query objects
      const userQuery = { queryKey: ['users', '123'] };
      const notificationQuery = { queryKey: ['notifications', '456'] };
      const defaultQuery = { queryKey: ['complaints', '789'] };

      const staleTimeFn = defaultOptions.queries?.staleTime as Function;

      expect(staleTimeFn(userQuery)).toBe(10 * 60 * 1000); // 10 minutes for users
      expect(staleTimeFn(notificationQuery)).toBe(30 * 1000); // 30 seconds for notifications
      expect(staleTimeFn(defaultQuery)).toBe(1000); // Default TTL
    });

    it('should apply different refetch policies based on query type', () => {
      const queryClient = cacheManager.getQueryClient();
      const defaultOptions = queryClient.getDefaultOptions();

      const staticQuery = { queryKey: ['templates', '123'] };
      const dynamicQuery = { queryKey: ['complaints', '456'] };

      const refetchFn = defaultOptions.queries?.refetchOnWindowFocus as Function;

      expect(refetchFn(staticQuery)).toBe(false); // Don't refetch static data
      expect(refetchFn(dynamicQuery)).toBe(true); // Refetch dynamic data
    });
  });

  describe('statistics tracking', () => {
    it('should track cache hits and misses', () => {
      cacheManager.trackAccess('test-key', true); // Hit
      cacheManager.trackAccess('test-key-2', false); // Miss
      cacheManager.trackAccess('test-key', true); // Hit

      const stats = cacheManager.getStats();

      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(66.66666666666666); // 2/3 * 100
    });

    it('should reset statistics', () => {
      cacheManager.trackAccess('test-key', true);

      cacheManager.resetStats();
      const stats = cacheManager.getStats();

      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(0);
    });
  });

  describe('configuration', () => {
    it('should update configuration', () => {
      cacheManager.updateConfig({ ttl: 2000 });

      const config = cacheManager.getConfig();
      expect(config.ttl).toBe(2000);
    });

    it('should get current configuration', () => {
      const config = cacheManager.getConfig();

      expect(config.ttl).toBe(1000);
      expect(config.maxSize).toBe(10);
      expect(config.strategy).toBe('lru');
    });
  });

  describe('garbage collection', () => {
    it('should manually trigger garbage collection', () => {
      const spy = vi.spyOn(cacheManager as any, 'performIntelligentGC');

      cacheManager.triggerGC();

      expect(spy).toHaveBeenCalled();
    });

    it('should update GC statistics', () => {
      cacheManager.triggerGC();

      const stats = cacheManager.getStats();
      expect(stats.gcCount).toBe(1);
      expect(stats.lastGC).toBeTruthy();
    });
  });

  describe('memory management', () => {
    it('should estimate data size', () => {
      const estimateDataSize = (cacheManager as any).estimateDataSize.bind(cacheManager);

      const smallData = { id: 1 };
      const largeData = { id: 1, data: 'x'.repeat(1000) };

      const smallSize = estimateDataSize(smallData);
      const largeSize = estimateDataSize(largeData);

      expect(largeSize).toBeGreaterThan(smallSize);
    });

    it('should handle null/undefined data', () => {
      const estimateDataSize = (cacheManager as any).estimateDataSize.bind(cacheManager);

      expect(estimateDataSize(null)).toBe(0);
      expect(estimateDataSize(undefined)).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should clear all cache data', () => {
      const queryClient = cacheManager.getQueryClient();
      const clearSpy = vi.spyOn(queryClient, 'clear');

      cacheManager.clear();

      expect(clearSpy).toHaveBeenCalled();

      const stats = cacheManager.getStats();
      expect(stats.totalEntries).toBe(0);
      expect(stats.memoryUsage).toBe(0);
    });

    it('should destroy resources properly', () => {
      const clearSpy = vi.spyOn(cacheManager, 'clear');

      cacheManager.destroy();

      expect(clearSpy).toHaveBeenCalled();
    });
  });
});

describe('createEnhancedQueryClient', () => {
  it('should create a QueryClient with custom config', () => {
    const queryClient = createEnhancedQueryClient({
      ttl: 5000,
      persistentStorage: false,
    });

    expect(queryClient).toBeInstanceOf(QueryClient);
  });
});

describe('CacheInvalidator', () => {
  let queryClient: QueryClient;
  let invalidator: CacheInvalidator;

  beforeEach(() => {
    queryClient = new QueryClient();
    invalidator = new CacheInvalidator(queryClient);
  });

  describe('invalidateComplaints', () => {
    it('should invalidate complaint queries', () => {
      const spy = vi.spyOn(queryClient, 'invalidateQueries');

      invalidator.invalidateComplaints('123');

      expect(spy).toHaveBeenCalledWith({ queryKey: ['complaint', '123'] });
      expect(spy).toHaveBeenCalledWith({ queryKey: ['complaints'] });
      expect(spy).toHaveBeenCalledWith({ queryKey: ['complaint-stats'] });
    });

    it('should invalidate general complaint queries without ID', () => {
      const spy = vi.spyOn(queryClient, 'invalidateQueries');

      invalidator.invalidateComplaints();

      expect(spy).toHaveBeenCalledWith({ queryKey: ['complaints'] });
      expect(spy).toHaveBeenCalledWith({ queryKey: ['complaint-stats'] });
    });
  });

  describe('invalidateUser', () => {
    it('should invalidate user queries', () => {
      const spy = vi.spyOn(queryClient, 'invalidateQueries');

      invalidator.invalidateUser('456');

      expect(spy).toHaveBeenCalledWith({ queryKey: ['user', '456'] });
      expect(spy).toHaveBeenCalledWith({ queryKey: ['users'] });
    });
  });

  describe('invalidateNotifications', () => {
    it('should invalidate notification queries', () => {
      const spy = vi.spyOn(queryClient, 'invalidateQueries');

      invalidator.invalidateNotifications('789');

      expect(spy).toHaveBeenCalledWith({ queryKey: ['notifications', '789'] });
      expect(spy).toHaveBeenCalledWith({ queryKey: ['notifications'] });
    });
  });

  describe('smartInvalidate', () => {
    it('should invalidate complaints for complaint mutations', () => {
      const spy = vi.spyOn(invalidator, 'invalidateComplaints');

      invalidator.smartInvalidate('complaint-create', '123');

      expect(spy).toHaveBeenCalledWith('123');
    });

    it('should invalidate users for user mutations', () => {
      const spy = vi.spyOn(invalidator, 'invalidateUser');

      invalidator.smartInvalidate('user-update', '456');

      expect(spy).toHaveBeenCalledWith('456');
    });

    it('should invalidate notifications for notification mutations', () => {
      const spy = vi.spyOn(invalidator, 'invalidateNotifications');

      invalidator.smartInvalidate('notification-create', '789');

      expect(spy).toHaveBeenCalledWith('789');
    });

    it('should fallback to invalidating all queries for unknown mutations', () => {
      const spy = vi.spyOn(queryClient, 'invalidateQueries');

      invalidator.smartInvalidate('unknown-mutation');

      expect(spy).toHaveBeenCalledWith();
    });
  });
});

describe('createCacheInvalidator', () => {
  it('should create a CacheInvalidator instance', () => {
    const queryClient = new QueryClient();
    const invalidator = createCacheInvalidator(queryClient);

    expect(invalidator).toBeInstanceOf(CacheInvalidator);
  });
});

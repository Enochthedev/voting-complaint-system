/**
 * Tests for request deduplication system
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  RequestDeduplicator,
  globalDeduplicator,
  deduplicateRequest,
} from '../request-deduplicator';

describe('RequestDeduplicator', () => {
  let deduplicator: RequestDeduplicator;

  beforeEach(() => {
    deduplicator = new RequestDeduplicator({
      windowMs: 1000, // 1 second for testing
      maxPendingRequests: 10,
      enabled: true,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    deduplicator.clear();
  });

  describe('generateRequestKey', () => {
    it('should generate consistent keys for identical requests', () => {
      const key1 = deduplicator.generateRequestKey('GET', '/api/test', { id: 1 });
      const key2 = deduplicator.generateRequestKey('GET', '/api/test', { id: 1 });

      expect(key1).toBe(key2);
    });

    it('should generate different keys for different methods', () => {
      const key1 = deduplicator.generateRequestKey('GET', '/api/test');
      const key2 = deduplicator.generateRequestKey('POST', '/api/test');

      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different URLs', () => {
      const key1 = deduplicator.generateRequestKey('GET', '/api/test1');
      const key2 = deduplicator.generateRequestKey('GET', '/api/test2');

      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different parameters', () => {
      const key1 = deduplicator.generateRequestKey('GET', '/api/test', { id: 1 });
      const key2 = deduplicator.generateRequestKey('GET', '/api/test', { id: 2 });

      expect(key1).not.toBe(key2);
    });

    it('should handle parameter order consistently', () => {
      const key1 = deduplicator.generateRequestKey('GET', '/api/test', { a: 1, b: 2 });
      const key2 = deduplicator.generateRequestKey('GET', '/api/test', { b: 2, a: 1 });

      expect(key1).toBe(key2);
    });
  });

  describe('execute', () => {
    it('should execute unique requests normally', async () => {
      const mockFn = vi.fn().mockResolvedValue('result');

      const result = await deduplicator.execute('test-key', mockFn);

      expect(result).toBe('result');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should deduplicate identical requests within time window', async () => {
      const mockFn = vi.fn().mockResolvedValue('result');

      // Start two identical requests simultaneously
      const promise1 = deduplicator.execute('test-key', mockFn);
      const promise2 = deduplicator.execute('test-key', mockFn);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBe('result');
      expect(result2).toBe('result');
      expect(mockFn).toHaveBeenCalledTimes(1); // Only called once due to deduplication
    });

    it('should not deduplicate requests outside time window', async () => {
      const mockFn = vi.fn().mockResolvedValue('result');

      // Execute first request
      await deduplicator.execute('test-key', mockFn);

      // Advance time beyond window
      vi.advanceTimersByTime(1500);

      // Execute second request
      await deduplicator.execute('test-key', mockFn);

      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should respect cache=false option', async () => {
      const mockFn = vi.fn().mockResolvedValue('result');

      // Start two identical requests with cache disabled
      const promise1 = deduplicator.execute('test-key', mockFn, { cache: false });
      const promise2 = deduplicator.execute('test-key', mockFn, { cache: false });

      await Promise.all([promise1, promise2]);

      expect(mockFn).toHaveBeenCalledTimes(2); // Both should execute
    });

    it('should clean up completed requests', async () => {
      const mockFn = vi.fn().mockResolvedValue('result');

      await deduplicator.execute('test-key', mockFn);

      const stats = deduplicator.getStats();
      expect(stats.pendingRequests).toBe(0);
    });
  });

  describe('statistics', () => {
    it('should track request statistics correctly', async () => {
      const mockFn = vi.fn().mockResolvedValue('result');

      // Execute some requests - need to run them simultaneously for deduplication
      const promise1 = deduplicator.execute('key1', mockFn);
      const promise2 = deduplicator.execute('key1', mockFn); // This should be deduplicated
      const promise3 = deduplicator.execute('key2', mockFn); // Unique

      await Promise.all([promise1, promise2, promise3]);

      const stats = deduplicator.getStats();

      expect(stats.totalRequests).toBe(3);
      expect(stats.uniqueRequests).toBe(2); // key1 (first time) + key2
      expect(stats.deduplicatedRequests).toBe(1); // key1 (second time)
      expect(stats.deduplicationRate).toBe(33.33333333333333);
    });

    it('should reset statistics', async () => {
      const mockFn = vi.fn().mockResolvedValue('result');

      await deduplicator.execute('test-key', mockFn);

      deduplicator.resetStats();
      const stats = deduplicator.getStats();

      expect(stats.totalRequests).toBe(0);
      expect(stats.uniqueRequests).toBe(0);
      expect(stats.deduplicatedRequests).toBe(0);
    });
  });

  describe('configuration', () => {
    it('should update configuration', () => {
      deduplicator.updateConfig({ windowMs: 2000 });

      const config = deduplicator.getConfig();
      expect(config.windowMs).toBe(2000);
    });

    it('should respect enabled/disabled state', async () => {
      const mockFn = vi.fn().mockResolvedValue('result');

      deduplicator.updateConfig({ enabled: false });

      // Start two identical requests
      const promise1 = deduplicator.execute('test-key', mockFn);
      const promise2 = deduplicator.execute('test-key', mockFn);

      await Promise.all([promise1, promise2]);

      expect(mockFn).toHaveBeenCalledTimes(2); // Both should execute when disabled
    });
  });
});

describe('deduplicateRequest utility', () => {
  beforeEach(() => {
    globalDeduplicator.clear();
    globalDeduplicator.resetStats();
  });

  it('should deduplicate requests using the utility function', async () => {
    const mockFn = vi.fn().mockResolvedValue('result');

    const promise1 = deduplicateRequest('GET', '/api/test', mockFn, { id: 1 });
    const promise2 = deduplicateRequest('GET', '/api/test', mockFn, { id: 1 });

    const [result1, result2] = await Promise.all([promise1, promise2]);

    expect(result1).toBe('result');
    expect(result2).toBe('result');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});

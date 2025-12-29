/**
 * Tests for batch query optimizer
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  BatchOptimizer,
  globalBatchOptimizer,
  batchComplaintQueries,
  createBatchExecutor,
} from '../batch-optimizer';

describe('BatchOptimizer', () => {
  let optimizer: BatchOptimizer;

  beforeEach(() => {
    optimizer = new BatchOptimizer({
      batchWindow: 50,
      maxBatchSize: 5,
      enabled: true,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    // Don't call clear() here to avoid unhandled promise rejections
    // Each test should manage its own cleanup
  });

  describe('batchRequest', () => {
    it('should execute single request immediately when batching disabled', async () => {
      optimizer.updateConfig({ enabled: false });
      const mockExecutor = vi.fn().mockResolvedValue(['result1']);

      const result = await optimizer.batchRequest('test-batch', 'param1', mockExecutor);

      expect(result).toBe('result1');
      expect(mockExecutor).toHaveBeenCalledWith(['param1']);
    });

    it('should batch multiple requests within time window', async () => {
      const mockExecutor = vi.fn().mockResolvedValue(['result1', 'result2']);

      // Start two requests
      const promise1 = optimizer.batchRequest('test-batch', 'param1', mockExecutor);
      const promise2 = optimizer.batchRequest('test-batch', 'param2', mockExecutor);

      // Advance time to trigger batch execution
      vi.advanceTimersByTime(60);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBe('result1');
      expect(result2).toBe('result2');
      expect(mockExecutor).toHaveBeenCalledTimes(1);
      expect(mockExecutor).toHaveBeenCalledWith(['param1', 'param2']);
    });

    it('should execute batch immediately when max size reached', async () => {
      const mockExecutor = vi.fn().mockResolvedValue(['r1', 'r2', 'r3', 'r4', 'r5']);

      // Add requests up to max batch size
      const promises = [];
      for (let i = 1; i <= 5; i++) {
        promises.push(optimizer.batchRequest('test-batch', `param${i}`, mockExecutor));
      }

      const results = await Promise.all(promises);

      expect(results).toEqual(['r1', 'r2', 'r3', 'r4', 'r5']);
      expect(mockExecutor).toHaveBeenCalledTimes(1);
    });

    it('should handle batch executor errors', async () => {
      const mockExecutor = vi.fn().mockRejectedValue(new Error('Batch failed'));

      const promise1 = optimizer.batchRequest('test-batch', 'param1', mockExecutor);
      const promise2 = optimizer.batchRequest('test-batch', 'param2', mockExecutor);

      vi.advanceTimersByTime(60);

      await expect(promise1).rejects.toThrow('Batch failed');
      await expect(promise2).rejects.toThrow('Batch failed');
    });

    it('should handle mismatched result count', async () => {
      const mockExecutor = vi.fn().mockResolvedValue(['result1']); // Only 1 result for 2 requests

      const promise1 = optimizer.batchRequest('test-batch', 'param1', mockExecutor);
      const promise2 = optimizer.batchRequest('test-batch', 'param2', mockExecutor);

      vi.advanceTimersByTime(60);

      await expect(promise1).rejects.toThrow('returned 1 results for 2 requests');
      await expect(promise2).rejects.toThrow('returned 1 results for 2 requests');
    });

    it('should separate batches by key', async () => {
      const mockExecutor1 = vi.fn().mockResolvedValue(['result1']);
      const mockExecutor2 = vi.fn().mockResolvedValue(['result2']);

      const promise1 = optimizer.batchRequest('batch1', 'param1', mockExecutor1);
      const promise2 = optimizer.batchRequest('batch2', 'param2', mockExecutor2);

      vi.advanceTimersByTime(60);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBe('result1');
      expect(result2).toBe('result2');
      expect(mockExecutor1).toHaveBeenCalledWith(['param1']);
      expect(mockExecutor2).toHaveBeenCalledWith(['param2']);
    });
  });

  describe('statistics', () => {
    it('should track batch statistics correctly', async () => {
      const mockExecutor = vi.fn().mockResolvedValue(['r1', 'r2', 'r3']);

      // Execute a batch of 3 requests
      const promises = [
        optimizer.batchRequest('test-batch', 'p1', mockExecutor),
        optimizer.batchRequest('test-batch', 'p2', mockExecutor),
        optimizer.batchRequest('test-batch', 'p3', mockExecutor),
      ];

      vi.advanceTimersByTime(60);
      await Promise.all(promises);

      const stats = optimizer.getStats();

      expect(stats.totalRequests).toBe(3);
      expect(stats.batchesExecuted).toBe(1);
      expect(stats.averageBatchSize).toBe(3);
      expect(stats.requestsSaved).toBe(2); // 3 requests - 1 batch = 2 saved
      expect(stats.batchEfficiency).toBe(66.66666666666666); // 2/3 * 100
    });

    it('should reset statistics', async () => {
      const mockExecutor = vi.fn().mockResolvedValue(['result']);

      const promise = optimizer.batchRequest('test-batch', 'param', mockExecutor);
      vi.advanceTimersByTime(60);
      await promise;

      optimizer.resetStats();
      const stats = optimizer.getStats();

      expect(stats.totalRequests).toBe(0);
      expect(stats.batchesExecuted).toBe(0);
      expect(stats.requestsSaved).toBe(0);
    });
  });

  describe('configuration', () => {
    it('should update configuration', () => {
      optimizer.updateConfig({ batchWindow: 100 });

      const config = optimizer.getConfig();
      expect(config.batchWindow).toBe(100);
    });

    it('should get pending batches info', () => {
      const mockExecutor = vi.fn();

      optimizer.batchRequest('batch1', 'param1', mockExecutor);
      optimizer.batchRequest('batch1', 'param2', mockExecutor);
      optimizer.batchRequest('batch2', 'param3', mockExecutor);

      const pending = optimizer.getPendingBatches();

      expect(pending).toEqual({
        batch1: 2,
        batch2: 1,
      });
    });
  });

  describe('clear', () => {
    it('should clear all pending batches and reject promises', async () => {
      const mockExecutor = vi.fn();

      const promise = optimizer.batchRequest('test-batch', 'param', mockExecutor);

      optimizer.clear();

      await expect(promise).rejects.toThrow('Batch optimizer cleared');
    });
  });
});

describe('utility functions', () => {
  beforeEach(() => {
    globalBatchOptimizer.clear();
    globalBatchOptimizer.resetStats();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('batchComplaintQueries', () => {
    it('should batch complaint queries correctly', async () => {
      const mockQueryFn = vi.fn().mockResolvedValue([
        { id: '1', title: 'Complaint 1' },
        { id: '2', title: 'Complaint 2' },
      ]);

      const promise = batchComplaintQueries(['1', '2'], mockQueryFn);

      vi.advanceTimersByTime(60);
      const result = await promise;

      expect(result).toEqual([
        { id: '1', title: 'Complaint 1' },
        { id: '2', title: 'Complaint 2' },
      ]);
      expect(mockQueryFn).toHaveBeenCalledWith(['1', '2']);
    });
  });

  describe('createBatchExecutor', () => {
    it('should create a working batch executor', async () => {
      const mockQueryFn = vi.fn().mockResolvedValue([
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ]);

      const executor = createBatchExecutor(mockQueryFn);
      const result = await executor([['1'], ['2']]);

      expect(result).toEqual([
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ]);
      expect(mockQueryFn).toHaveBeenCalledWith(['1', '2']);
    });
  });
});

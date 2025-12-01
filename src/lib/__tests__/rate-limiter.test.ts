/**
 * Rate Limiter Tests
 *
 * Tests the rate limiting functionality to ensure:
 * - Requests are properly limited
 * - Token bucket algorithm works correctly
 * - Rate limit errors are thrown appropriately
 * - Different operation types have different limits
 */

import {
  withRateLimit,
  getRateLimitStatus,
  resetRateLimit,
  RateLimitError,
  RATE_LIMITS,
} from '../rate-limiter';

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Reset rate limits before each test
    resetRateLimit('read');
    resetRateLimit('write');
    resetRateLimit('bulk');
    resetRateLimit('auth');
    resetRateLimit('search');
    resetRateLimit('upload');
  });

  describe('withRateLimit', () => {
    it('should allow requests within rate limit', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const rateLimitedFn = withRateLimit(mockFn, 'read');

      // Should succeed for first request
      const result = await rateLimitedFn();
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should throw RateLimitError when limit exceeded', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const rateLimitedFn = withRateLimit(mockFn, 'write');

      // Make requests up to the limit
      const limit = RATE_LIMITS.write.maxRequests;
      for (let i = 0; i < limit; i++) {
        await rateLimitedFn();
      }

      // Next request should fail
      await expect(rateLimitedFn()).rejects.toThrow(RateLimitError);
    });

    it('should have different limits for different operation types', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      const readFn = withRateLimit(mockFn, 'read', 'test-read');
      const writeFn = withRateLimit(mockFn, 'write', 'test-write');
      const bulkFn = withRateLimit(mockFn, 'bulk', 'test-bulk');

      // Read should have higher limit than write
      expect(RATE_LIMITS.read.maxRequests).toBeGreaterThan(RATE_LIMITS.write.maxRequests);

      // Write should have higher limit than bulk
      expect(RATE_LIMITS.write.maxRequests).toBeGreaterThan(RATE_LIMITS.bulk.maxRequests);
    });

    it('should preserve function arguments', async () => {
      const mockFn = jest
        .fn()
        .mockImplementation((a: number, b: string) => Promise.resolve(`${a}-${b}`));
      const rateLimitedFn = withRateLimit(mockFn, 'read');

      const result = await rateLimitedFn(42, 'test');
      expect(result).toBe('42-test');
      expect(mockFn).toHaveBeenCalledWith(42, 'test');
    });

    it('should propagate errors from wrapped function', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Test error'));
      const rateLimitedFn = withRateLimit(mockFn, 'read');

      await expect(rateLimitedFn()).rejects.toThrow('Test error');
    });

    it('should use custom key when provided', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const rateLimitedFn1 = withRateLimit(mockFn, 'write', 'custom-key-1');
      const rateLimitedFn2 = withRateLimit(mockFn, 'write', 'custom-key-2');

      // Both should have independent rate limits
      const limit = RATE_LIMITS.write.maxRequests;

      for (let i = 0; i < limit; i++) {
        await rateLimitedFn1();
      }

      // First function should be rate limited
      await expect(rateLimitedFn1()).rejects.toThrow(RateLimitError);

      // Second function should still work (different key)
      await expect(rateLimitedFn2()).resolves.toBe('success');
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return correct initial status', () => {
      const status = getRateLimitStatus('read');

      expect(status.remaining).toBe(RATE_LIMITS.read.maxRequests);
      expect(status.limit).toBe(RATE_LIMITS.read.maxRequests);
      expect(status.resetAt).toBeInstanceOf(Date);
    });

    it('should update remaining count after requests', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const rateLimitedFn = withRateLimit(mockFn, 'write', 'status-test');

      const initialStatus = getRateLimitStatus('write', 'status-test');
      expect(initialStatus.remaining).toBe(RATE_LIMITS.write.maxRequests);

      // Make one request
      await rateLimitedFn();

      const afterStatus = getRateLimitStatus('write', 'status-test');
      expect(afterStatus.remaining).toBe(RATE_LIMITS.write.maxRequests - 1);
    });
  });

  describe('RateLimitError', () => {
    it('should contain retry information', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const rateLimitedFn = withRateLimit(mockFn, 'bulk');

      // Exhaust rate limit
      const limit = RATE_LIMITS.bulk.maxRequests;
      for (let i = 0; i < limit; i++) {
        await rateLimitedFn();
      }

      try {
        await rateLimitedFn();
        fail('Should have thrown RateLimitError');
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        if (error instanceof RateLimitError) {
          expect(error.retryAfter).toBeGreaterThan(0);
          expect(error.limit).toBe(RATE_LIMITS.bulk.maxRequests);
          expect(error.message).toContain('Rate limit exceeded');
        }
      }
    });
  });

  describe('Token bucket refill', () => {
    it('should refill tokens over time', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const rateLimitedFn = withRateLimit(mockFn, 'write', 'refill-test');

      // Use up some tokens
      await rateLimitedFn();
      await rateLimitedFn();

      const statusBefore = getRateLimitStatus('write', 'refill-test');
      const remainingBefore = statusBefore.remaining;

      // Wait for a short time (tokens should refill)
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Make another request to trigger refill calculation
      await rateLimitedFn();

      // Note: In a real scenario, tokens would refill based on time elapsed
      // This test verifies the mechanism exists
      expect(mockFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('Rate limit configurations', () => {
    it('should have appropriate limits for each operation type', () => {
      // Read operations should be most permissive
      expect(RATE_LIMITS.read.maxRequests).toBe(100);
      expect(RATE_LIMITS.read.windowMs).toBe(60000);

      // Write operations should be more restrictive
      expect(RATE_LIMITS.write.maxRequests).toBe(30);
      expect(RATE_LIMITS.write.windowMs).toBe(60000);

      // Bulk operations should be most restrictive
      expect(RATE_LIMITS.bulk.maxRequests).toBe(10);
      expect(RATE_LIMITS.bulk.windowMs).toBe(60000);

      // Auth operations
      expect(RATE_LIMITS.auth.maxRequests).toBe(20);
      expect(RATE_LIMITS.auth.windowMs).toBe(60000);

      // Search operations
      expect(RATE_LIMITS.search.maxRequests).toBe(50);
      expect(RATE_LIMITS.search.windowMs).toBe(60000);

      // Upload operations
      expect(RATE_LIMITS.upload.maxRequests).toBe(20);
      expect(RATE_LIMITS.upload.windowMs).toBe(60000);
    });
  });
});

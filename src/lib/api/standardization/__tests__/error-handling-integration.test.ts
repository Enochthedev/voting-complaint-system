/**
 * Integration tests for enhanced error handling and recovery
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RetrySystem } from '../retry-system';
import { rateLimitHandler } from '../rate-limit-handler';
import { ValidationUtils } from '../validation';
import { ErrorNormalizer } from '../error-normalizer';
import { ErrorType } from '../types';
import { z } from 'zod';

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'mock-token' } },
        error: null,
      }),
      refreshSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'new-mock-token' } },
        error: null,
      }),
    },
  },
}));

vi.mock('@/lib/timeout', () => ({
  withTimeout: vi.fn().mockImplementation((operation, timeout) => operation()),
  TIMEOUT_CONFIG: { default: 30000 },
  TimeoutError: class TimeoutError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'TimeoutError';
    }
  },
}));

describe('Enhanced Error Handling and Recovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Retry System', () => {
    it('should retry on retryable errors with exponential backoff', async () => {
      const retrySystem = new RetrySystem({
        maxAttempts: 3,
        baseDelayMs: 100,
        backoffMultiplier: 2,
      });

      let attempts = 0;
      const operation = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Network error');
        }
        return 'success';
      });

      const result = await retrySystem.execute(operation);

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toHaveLength(2); // 2 failed attempts before success
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable errors', async () => {
      const retrySystem = new RetrySystem({
        maxAttempts: 3,
        retryableErrors: [ErrorType.NETWORK_ERROR],
      });

      const operation = vi.fn().mockImplementation(() => {
        throw { status: 404, message: 'Not found' };
      });

      const result = await retrySystem.execute(operation);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(ErrorType.NOT_FOUND);
      expect(operation).toHaveBeenCalledTimes(1); // No retries
    });

    it('should handle authentication errors with token refresh', async () => {
      const retrySystem = new RetrySystem({
        maxAttempts: 2,
      });

      let attempts = 0;
      const operation = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts === 1) {
          throw { status: 401, message: 'Unauthorized' };
        }
        return 'success after auth refresh';
      });

      const result = await retrySystem.execute(operation);

      expect(result.success).toBe(true);
      expect(result.data).toBe('success after auth refresh');
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe('Rate Limit Handler', () => {
    it('should queue requests when rate limited', async () => {
      const handler = rateLimitHandler;

      // Simulate rate limit error
      let callCount = 0;
      const operation = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw {
            status: 429,
            message: 'Rate limit exceeded',
            headers: {
              'retry-after': '1',
              'x-ratelimit-remaining': '0',
              'x-ratelimit-reset': Math.floor(Date.now() / 1000) + 2,
            },
          };
        }
        return `success-${callCount}`;
      });

      const promise = handler.execute(operation, 'test-key', 1);

      // Should eventually succeed after rate limit resets
      const result = await promise;
      expect(result).toBe('success-2');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should provide rate limit status information', () => {
      const status = rateLimitHandler.getRateLimitStatus('test-key');

      expect(status).toHaveProperty('isLimited');
      expect(status).toHaveProperty('info');
      expect(status).toHaveProperty('waitTimeMs');
      expect(status).toHaveProperty('message');
    });
  });

  describe('Input Validation Enforcement', () => {
    it('should validate inputs with detailed error information', () => {
      const schema = z.object({
        name: z.string().min(2).max(50),
        email: z.string().email(),
        age: z.number().int().min(18).max(120),
      });

      const invalidInput = {
        name: 'A', // Too short
        email: 'invalid-email', // Invalid format
        age: 15, // Too young
      };

      const result = ValidationUtils.validateWithDetails(invalidInput, schema);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(ErrorType.VALIDATION);
      expect(result.error?.details?.fields).toHaveLength(3);

      const fields = result.error?.details?.fields || [];
      expect(fields.some((f) => f.field === 'name')).toBe(true);
      expect(fields.some((f) => f.field === 'email')).toBe(true);
      expect(fields.some((f) => f.field === 'age')).toBe(true);
    });

    it('should validate external API responses', () => {
      const responseSchema = z.object({
        data: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
          })
        ),
        total: z.number(),
      });

      const validResponse = {
        status: 200,
        data: {
          data: [{ id: '1', name: 'Test' }],
          total: 1,
        },
      };

      const result = ValidationUtils.validateExternalApiResponse(validResponse, responseSchema);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validResponse.data);
    });

    it('should handle external API error responses', () => {
      const errorResponse = {
        status: 500,
        data: { error: 'Internal server error' },
      };

      const result = ValidationUtils.validateExternalApiResponse(errorResponse);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(ErrorType.SERVER_ERROR);
    });

    it('should sanitize input data', () => {
      const dirtyInput = {
        name: '  John Doe  ',
        tags: ['  tag1  ', '  tag2  '],
        nested: {
          value: '  nested value  ',
        },
      };

      const sanitized = ValidationUtils.sanitize(dirtyInput);

      expect(sanitized).toEqual({
        name: 'John Doe',
        tags: ['tag1', 'tag2'],
        nested: {
          value: 'nested value',
        },
      });
    });
  });

  describe('Error Normalization', () => {
    it('should normalize Zod validation errors', () => {
      const schema = z.object({
        name: z.string().min(2),
      });

      try {
        schema.parse({ name: 'A' });
      } catch (error) {
        const normalized = ErrorNormalizer.normalize(error);

        expect(normalized.type).toBe(ErrorType.VALIDATION);
        expect(normalized.code).toBe('VALIDATION_ERROR');
        expect(normalized.details?.fields).toHaveLength(1);
        expect(normalized.details?.fields?.[0].field).toBe('name');
      }
    });

    it('should normalize HTTP errors', () => {
      const httpError = {
        status: 404,
        statusText: 'Not Found',
        message: 'Resource not found',
      };

      const normalized = ErrorNormalizer.normalize(httpError);

      expect(normalized.type).toBe(ErrorType.NOT_FOUND);
      expect(normalized.code).toBe('HTTP_404');
      expect(normalized.message).toBe('Resource not found');
    });

    it('should normalize Supabase errors', () => {
      const supabaseError = {
        code: 'PGRST116',
        message: 'The result contains 0 rows',
        hint: 'Check your query parameters',
      };

      const normalized = ErrorNormalizer.normalize(supabaseError);

      expect(normalized.type).toBe(ErrorType.NOT_FOUND);
      expect(normalized.code).toBe('PGRST116');
      expect(normalized.details?.context?.supabaseCode).toBe('PGRST116');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complex error recovery scenario', async () => {
      const retrySystem = new RetrySystem({
        maxAttempts: 3,
        baseDelayMs: 50,
      });

      let attempts = 0;
      const operation = vi.fn().mockImplementation(() => {
        attempts++;

        if (attempts === 1) {
          // First attempt: network error (retryable)
          throw new Error('Network timeout');
        } else if (attempts === 2) {
          // Second attempt: auth error (retryable with refresh)
          throw { status: 401, message: 'Token expired' };
        } else {
          // Third attempt: success
          return { data: 'recovered successfully', attempts };
        }
      });

      const result = await retrySystem.execute(operation);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ data: 'recovered successfully', attempts: 3 });
      expect(result.attempts).toHaveLength(2); // 2 failed attempts
      expect(operation).toHaveBeenCalledTimes(3);
    });
  });
});

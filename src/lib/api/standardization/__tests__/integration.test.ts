/**
 * Integration tests for API standardization infrastructure
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  RequestFormatter,
  ResponseFormatter,
  ValidationUtils,
  ApiCache,
  ApiRateLimiter,
  CommonSchemas,
} from '../index';

describe('API Standardization Integration', () => {
  describe('Component integration', () => {
    it('should integrate request formatting with validation', () => {
      const formatter = new RequestFormatter();

      const data = { page: 2, limit: 20 };
      const schema = CommonSchemas.pagination;

      const result = formatter.formatRequest(data, schema);

      expect(result.data).toEqual(data);
      expect(result.options.validate).toBe(true);
    });

    it('should integrate caching with rate limiting', () => {
      const cache = new ApiCache({ ttl: 1000, maxSize: 10 });
      const rateLimiter = new ApiRateLimiter({
        windowMs: 60000,
        maxRequests: 5,
      });

      // Test cache operations
      cache.set('test-key', { data: 'test' });
      const cached = cache.get('test-key');
      expect(cached.data).toEqual({ data: 'test' });
      expect(cached.info.hit).toBe(true);

      // Test rate limiting
      expect(rateLimiter.isAllowed('user-1')).toBe(true);
      expect(rateLimiter.getRemaining('user-1')).toBe(4);
    });

    // Property-based test for end-to-end workflow
    it('should maintain data integrity through complete workflow', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            name: fc.string({ minLength: 2, maxLength: 50 }), // Avoid single space strings
            status: fc.constantFrom('active', 'inactive', 'pending'),
          }),
          (inputData) => {
            const formatter = new RequestFormatter();
            const responseFormatter = new ResponseFormatter();

            // Format request
            const request = formatter.formatRequest(inputData);
            expect(request.data).toEqual(inputData);

            // Create successful response
            const response = responseFormatter.success(inputData);
            expect(response.data).toEqual(inputData);
            expect(response.error).toBeNull();

            // Transform response
            const transformed = responseFormatter.transform(response, (data) => ({
              ...data,
              processed: true,
            }));

            expect(transformed.data).toEqual({
              ...inputData,
              processed: true,
            });
          }
        )
      );
    });
  });

  describe('Error handling integration', () => {
    it('should provide consistent error format across components', () => {
      const responseFormatter = new ResponseFormatter();

      // Test different error scenarios
      const validationError = responseFormatter.error('VALIDATION_ERROR', 'Invalid input data', {
        field: 'name',
        reason: 'required',
      });

      const networkError = responseFormatter.error('NETWORK_ERROR', 'Connection failed');

      // Both should have consistent structure
      expect(validationError.error).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        timestamp: expect.any(String),
        details: { field: 'name', reason: 'required' },
      });

      expect(networkError.error).toMatchObject({
        code: 'NETWORK_ERROR',
        message: 'Connection failed',
        timestamp: expect.any(String),
      });
    });
  });

  describe('Complete workflow without external dependencies', () => {
    it('should handle request formatting and response formatting together', () => {
      const requestFormatter = new RequestFormatter();
      const responseFormatter = new ResponseFormatter();

      // Format a request
      const requestData = { name: 'test', page: 1, limit: 10 };
      const formattedRequest = requestFormatter.formatRequest(requestData);

      // Simulate processing and create response
      const processedData = { ...formattedRequest.data, id: 123, created: true };
      const response = responseFormatter.success(processedData);

      expect(response.data).toMatchObject({
        name: 'test',
        page: 1,
        limit: 10,
        id: 123,
        created: true,
      });
      expect(response.error).toBeNull();
    });

    it('should handle pagination workflow', () => {
      const requestFormatter = new RequestFormatter();
      const responseFormatter = new ResponseFormatter();

      // Create pagination params
      const paginationParams = requestFormatter.createPaginationParams(2, 15);

      // Simulate data retrieval
      const mockData = Array.from({ length: 15 }, (_, i) => ({
        id: paginationParams.offset + i + 1,
        name: `Item ${paginationParams.offset + i + 1}`,
      }));

      // Calculate pagination info
      const paginationInfo = responseFormatter.calculatePagination(100, 2, 15);

      // Create paginated response
      const response = responseFormatter.paginated(mockData, paginationInfo);

      expect(response.data).toHaveLength(15);
      expect(response.data?.[0]).toEqual({ id: 16, name: 'Item 16' });
      expect(response.metadata?.pagination).toEqual({
        page: 2,
        limit: 15,
        total: 100,
        hasNext: true,
        hasPrev: true,
      });
    });
  });
});

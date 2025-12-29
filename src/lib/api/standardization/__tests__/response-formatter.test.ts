/**
 * Tests for ResponseFormatter
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ResponseFormatter } from '../response-formatter';

describe('ResponseFormatter', () => {
  const formatter = new ResponseFormatter();

  describe('success', () => {
    it('should create successful response', () => {
      const data = { id: 1, name: 'test' };
      const result = formatter.success(data);

      expect(result).toEqual({
        data,
        error: null,
        metadata: undefined,
      });
    });

    it('should include metadata when provided', () => {
      const data = { id: 1 };
      const metadata = { timing: { duration: 100, timestamp: '2023-01-01' } };
      const result = formatter.success(data, metadata);

      expect(result.metadata).toEqual(metadata);
    });
  });

  describe('error', () => {
    it('should create error response', () => {
      const result = formatter.error('TEST_ERROR', 'Test error message');

      expect(result.data).toBeNull();
      expect(result.error).toMatchObject({
        code: 'TEST_ERROR',
        message: 'Test error message',
        details: undefined,
      });
      expect(result.error?.timestamp).toBeDefined();
    });

    it('should include error details when provided', () => {
      const details = { field: 'name', value: 'invalid' };
      const result = formatter.error('VALIDATION_ERROR', 'Invalid input', details);

      expect(result.error?.details).toEqual(details);
    });
  });

  describe('calculatePagination', () => {
    it('should calculate pagination correctly', () => {
      const result = formatter.calculatePagination(100, 2, 20);

      expect(result).toEqual({
        page: 2,
        limit: 20,
        total: 100,
        hasNext: true,
        hasPrev: true,
      });
    });

    it('should handle first page', () => {
      const result = formatter.calculatePagination(100, 1, 20);

      expect(result.hasPrev).toBe(false);
      expect(result.hasNext).toBe(true);
    });

    it('should handle last page', () => {
      const result = formatter.calculatePagination(100, 5, 20);

      expect(result.hasPrev).toBe(true);
      expect(result.hasNext).toBe(false);
    });

    // Property-based test for pagination calculation
    it('should always calculate valid pagination', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000 }), // total
          fc.integer({ min: 1, max: 100 }), // page
          fc.integer({ min: 1, max: 50 }), // limit
          (total, page, limit) => {
            const result = formatter.calculatePagination(total, page, limit);
            const totalPages = Math.ceil(total / limit);

            expect(result.page).toBe(page);
            expect(result.limit).toBe(limit);
            expect(result.total).toBe(total);
            expect(result.hasNext).toBe(page < totalPages);
            expect(result.hasPrev).toBe(page > 1);
          }
        )
      );
    });
  });

  describe('paginated', () => {
    it('should create paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const pagination = {
        page: 1,
        limit: 20,
        total: 2,
        hasNext: false,
        hasPrev: false,
      };

      const result = formatter.paginated(data, pagination);

      expect(result.data).toEqual(data);
      expect(result.error).toBeNull();
      expect(result.metadata?.pagination).toEqual(pagination);
    });
  });

  describe('fromSupabase', () => {
    it('should convert successful Supabase response', () => {
      const supabaseResponse = {
        data: { id: 1, name: 'test' },
        error: null,
      };

      const result = formatter.fromSupabase(supabaseResponse);

      expect(result.data).toEqual(supabaseResponse.data);
      expect(result.error).toBeNull();
    });

    it('should convert Supabase error response', () => {
      const supabaseResponse = {
        data: null,
        error: {
          code: 'PGRST116',
          message: 'The result contains 0 rows',
        },
      };

      const result = formatter.fromSupabase(supabaseResponse);

      expect(result.data).toBeNull();
      expect(result.error).toMatchObject({
        code: 'PGRST116',
        message: 'The result contains 0 rows',
      });
    });
  });

  describe('transform', () => {
    it('should transform successful response data', () => {
      const response = formatter.success({ name: 'test' });
      const transformer = (data: any) => ({ ...data, transformed: true });

      const result = formatter.transform(response, transformer);

      expect(result.data).toEqual({ name: 'test', transformed: true });
      expect(result.error).toBeNull();
    });

    it('should pass through error responses unchanged', () => {
      const response = formatter.error('TEST_ERROR', 'Test message');
      const transformer = (data: any) => ({ ...data, transformed: true });

      const result = formatter.transform(response, transformer);

      expect(result).toEqual(response);
    });
  });
});

/**
 * Tests for RequestFormatter
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { z } from 'zod';
import { RequestFormatter } from '../request-formatter';

describe('RequestFormatter', () => {
  const formatter = new RequestFormatter();

  describe('formatRequest', () => {
    it('should format request with default options', () => {
      const data = { test: 'value' };
      const result = formatter.formatRequest(data);

      expect(result.data).toEqual(data);
      expect(result.options).toMatchObject({
        timeout: 30000,
        retries: 3,
        cache: true,
        rateLimit: true,
        validate: true,
      });
    });

    it('should merge custom options with defaults', () => {
      const data = { test: 'value' };
      const customOptions = { timeout: 5000, cache: false };
      const result = formatter.formatRequest(data, undefined, customOptions);

      expect(result.options).toMatchObject({
        timeout: 5000,
        retries: 3,
        cache: false,
        rateLimit: true,
        validate: true,
      });
    });

    it('should validate data when schema provided', () => {
      const schema = z.object({ name: z.string() });
      const validData = { name: 'test' };
      const invalidData = { name: 123 };

      expect(() => formatter.formatRequest(validData, schema)).not.toThrow();
      expect(() => formatter.formatRequest(invalidData, schema)).toThrow();
    });
  });

  describe('createPaginationParams', () => {
    it('should create valid pagination parameters', () => {
      const result = formatter.createPaginationParams(2, 10);

      expect(result).toEqual({
        offset: 10,
        limit: 10,
        page: 2,
      });
    });

    it('should use default values', () => {
      const result = formatter.createPaginationParams();

      expect(result).toEqual({
        offset: 0,
        limit: 20,
        page: 1,
      });
    });

    it('should validate page and limit bounds', () => {
      expect(() => formatter.createPaginationParams(0, 10)).toThrow('Page must be >= 1');
      expect(() => formatter.createPaginationParams(1, 0)).toThrow(
        'Limit must be between 1 and 100'
      );
      expect(() => formatter.createPaginationParams(1, 101)).toThrow(
        'Limit must be between 1 and 100'
      );
    });

    // Property-based test for pagination parameters
    it('should always create valid pagination for valid inputs', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }), // page
          fc.integer({ min: 1, max: 100 }), // limit
          (page, limit) => {
            const result = formatter.createPaginationParams(page, limit);

            expect(result.page).toBe(page);
            expect(result.limit).toBe(limit);
            expect(result.offset).toBe((page - 1) * limit);
            expect(result.offset).toBeGreaterThanOrEqual(0);
          }
        )
      );
    });
  });

  describe('createFilterParams', () => {
    it('should remove null, undefined, and empty string values', () => {
      const filters = {
        name: 'test',
        age: null,
        email: undefined,
        status: '',
        active: true,
        count: 0,
      };

      const result = formatter.createFilterParams(filters);

      expect(result).toEqual({
        name: 'test',
        active: true,
        count: 0,
      });
    });

    // Property-based test for filter cleaning
    it('should only include non-empty values', () => {
      fc.assert(
        fc.property(
          fc.record({
            validString: fc.string({ minLength: 1 }),
            validNumber: fc.integer(),
            validBoolean: fc.boolean(),
            nullValue: fc.constant(null),
            undefinedValue: fc.constant(undefined),
            emptyString: fc.constant(''),
          }),
          (filters) => {
            const result = formatter.createFilterParams(filters);

            // Should include valid values
            expect(result.validString).toBe(filters.validString);
            expect(result.validNumber).toBe(filters.validNumber);
            expect(result.validBoolean).toBe(filters.validBoolean);

            // Should exclude invalid values
            expect(result).not.toHaveProperty('nullValue');
            expect(result).not.toHaveProperty('undefinedValue');
            expect(result).not.toHaveProperty('emptyString');
          }
        )
      );
    });
  });

  describe('createSortParams', () => {
    it('should create sort parameters', () => {
      const result = formatter.createSortParams('name', 'desc');
      expect(result).toEqual({ order: 'name.desc' });
    });

    it('should default to ascending order', () => {
      const result = formatter.createSortParams('name');
      expect(result).toEqual({ order: 'name.asc' });
    });

    it('should return empty object when no sortBy provided', () => {
      const result = formatter.createSortParams();
      expect(result).toEqual({});
    });
  });
});

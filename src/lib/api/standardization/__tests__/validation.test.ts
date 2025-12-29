/**
 * Tests for ValidationUtils
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { z } from 'zod';
import { ValidationUtils, CommonSchemas } from '../validation';

describe('ValidationUtils', () => {
  describe('validate', () => {
    it('should validate data against schema', () => {
      const schema = z.object({ name: z.string(), age: z.number() });
      const validData = { name: 'John', age: 30 };
      const invalidData = { name: 'John', age: 'thirty' };

      expect(() => ValidationUtils.validate(validData, schema)).not.toThrow();
      expect(() => ValidationUtils.validate(invalidData, schema)).toThrow();
    });

    it('should return validated data', () => {
      const schema = z.object({ name: z.string().trim() });
      const data = { name: '  John  ' };

      const result = ValidationUtils.validate(data, schema);
      expect(result.name).toBe('John');
    });
  });

  describe('validatePagination', () => {
    it('should validate valid pagination params', () => {
      const params = { page: 1, limit: 20 };
      const result = ValidationUtils.validatePagination(params);

      expect(result).toEqual(params);
    });

    it('should use default values', () => {
      const result = ValidationUtils.validatePagination({});

      expect(result).toEqual({ page: 1, limit: 20 });
    });

    it('should reject invalid pagination params', () => {
      expect(() => ValidationUtils.validatePagination({ page: 0 })).toThrow();
      expect(() => ValidationUtils.validatePagination({ limit: 101 })).toThrow();
    });

    // Property-based test for pagination validation
    it('should validate pagination parameters correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }),
          fc.integer({ min: 1, max: 100 }),
          (page, limit) => {
            const params = { page, limit };
            const result = ValidationUtils.validatePagination(params);

            expect(result.page).toBe(page);
            expect(result.limit).toBe(limit);
          }
        )
      );
    });
  });

  describe('validateId', () => {
    it('should validate UUID', () => {
      const validId = '123e4567-e89b-12d3-a456-426614174000';
      const invalidId = 'not-a-uuid';

      expect(() => ValidationUtils.validateId(validId)).not.toThrow();
      expect(() => ValidationUtils.validateId(invalidId)).toThrow();
    });
  });

  describe('validateSearch', () => {
    it('should validate search parameters', () => {
      const params = {
        query: 'test search',
        filters: { status: 'active' },
        sort: { field: 'name', order: 'asc' as const },
      };

      const result = ValidationUtils.validateSearch(params);
      expect(result).toEqual(params);
    });

    it('should require query parameter', () => {
      expect(() => ValidationUtils.validateSearch({})).toThrow();
    });
  });

  describe('sanitize', () => {
    it('should trim strings', () => {
      const result = ValidationUtils.sanitize('  test  ');
      expect(result).toBe('test');
    });

    it('should sanitize nested objects', () => {
      const data = {
        name: '  John  ',
        details: {
          email: '  john@example.com  ',
        },
      };

      const result = ValidationUtils.sanitize(data);
      expect(result).toEqual({
        name: 'John',
        details: {
          email: 'john@example.com',
        },
      });
    });

    it('should sanitize arrays', () => {
      const data = ['  item1  ', '  item2  '];
      const result = ValidationUtils.sanitize(data);
      expect(result).toEqual(['item1', 'item2']);
    });

    // Property-based test for string sanitization
    it('should always trim whitespace from strings', () => {
      fc.assert(
        fc.property(fc.string(), (str) => {
          const result = ValidationUtils.sanitize(`  ${str}  `);
          expect(result).toBe(str.trim());
        })
      );
    });
  });

  describe('CommonSchemas', () => {
    it('should validate pagination schema', () => {
      const validData = { page: 1, limit: 20 };
      const result = CommonSchemas.pagination.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should validate ID schema', () => {
      const validId = '123e4567-e89b-12d3-a456-426614174000';
      const result = CommonSchemas.id.parse(validId);
      expect(result).toBe(validId);
    });

    it('should validate search schema', () => {
      const validSearch = {
        query: 'test',
        filters: { status: 'active' },
        sort: { field: 'name', order: 'asc' as const },
      };
      const result = CommonSchemas.search.parse(validSearch);
      expect(result).toEqual(validSearch);
    });
  });
});

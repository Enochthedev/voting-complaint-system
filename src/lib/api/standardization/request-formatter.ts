/**
 * Request formatting utilities for API standardization
 */

import { z } from 'zod';
import type { RequestOptions, ValidationSchema } from './types';

/**
 * Standard request formatter
 */
export class RequestFormatter {
  private defaultOptions: RequestOptions = {
    timeout: 30000,
    retries: 3,
    cache: true,
    rateLimit: true,
    validate: true,
  };

  /**
   * Format request with standard options
   */
  formatRequest<T>(
    data: T,
    schema?: ValidationSchema,
    options?: Partial<RequestOptions>
  ): { data: T; options: RequestOptions } {
    const mergedOptions = { ...this.defaultOptions, ...options };

    // Validate request data if schema provided
    if (schema && mergedOptions.validate) {
      const result = schema.safeParse(data);
      if (!result.success) {
        throw new Error(`Request validation failed: ${result.error.message}`);
      }
    }

    return {
      data,
      options: mergedOptions,
    };
  }

  /**
   * Create pagination parameters
   */
  createPaginationParams(page: number = 1, limit: number = 20) {
    if (page < 1) throw new Error('Page must be >= 1');
    if (limit < 1 || limit > 100) throw new Error('Limit must be between 1 and 100');

    return {
      offset: (page - 1) * limit,
      limit,
      page,
    };
  }

  /**
   * Create filter parameters
   */
  createFilterParams(filters: Record<string, any>) {
    const cleanFilters: Record<string, any> = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        cleanFilters[key] = value;
      }
    }

    return cleanFilters;
  }

  /**
   * Create sort parameters
   */
  createSortParams(sortBy?: string, sortOrder: 'asc' | 'desc' = 'asc') {
    if (!sortBy) return {};

    return {
      order: `${sortBy}.${sortOrder}`,
    };
  }
}

/**
 * Pagination Helper Utilities
 *
 * Provides utilities for consistent pagination across all API endpoints.
 * Ensures all paginated endpoints use the same format with navigation links.
 */

import type { PaginationMeta, PaginationLinks } from './types';

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
  baseUrl: string;
  queryParams?: Record<string, string>;
}

/**
 * Pagination helper class
 */
export class PaginationHelper {
  /**
   * Calculate pagination metadata with navigation links
   */
  static calculatePagination(config: PaginationConfig): PaginationMeta {
    const { page, limit, total, baseUrl, queryParams } = config;
    const totalPages = Math.ceil(total / limit);

    const links: PaginationLinks = {
      first: this.buildUrl(baseUrl, 1, limit, queryParams),
      prev: page > 1 ? this.buildUrl(baseUrl, page - 1, limit, queryParams) : null,
      next: page < totalPages ? this.buildUrl(baseUrl, page + 1, limit, queryParams) : null,
      last: this.buildUrl(baseUrl, totalPages, limit, queryParams),
    };

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      links,
    };
  }

  /**
   * Build pagination URL
   */
  private static buildUrl(
    baseUrl: string,
    page: number,
    limit: number,
    queryParams?: Record<string, string>
  ): string {
    const url = new URL(baseUrl);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', limit.toString());

    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (key !== 'page' && key !== 'limit') {
          // Don't override page/limit
          url.searchParams.set(key, value);
        }
      });
    }

    return url.toString();
  }

  /**
   * Validate pagination parameters
   */
  static validatePaginationParams(
    page?: string | number,
    limit?: string | number
  ): {
    page: number;
    limit: number;
    errors: string[];
  } {
    const errors: string[] = [];
    let validatedPage = 1;
    let validatedLimit = 20; // Default limit

    // Validate page
    if (page !== undefined) {
      const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
      if (isNaN(pageNum) || pageNum < 1) {
        errors.push('Page must be a positive integer');
      } else {
        validatedPage = pageNum;
      }
    }

    // Validate limit
    if (limit !== undefined) {
      const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
      if (isNaN(limitNum) || limitNum < 1) {
        errors.push('Limit must be a positive integer');
      } else if (limitNum > 100) {
        errors.push('Limit cannot exceed 100');
      } else {
        validatedLimit = limitNum;
      }
    }

    return {
      page: validatedPage,
      limit: validatedLimit,
      errors,
    };
  }

  /**
   * Calculate offset for database queries
   */
  static calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Extract pagination parameters from URL search params
   */
  static extractPaginationFromSearchParams(searchParams: URLSearchParams): {
    page: number;
    limit: number;
    errors: string[];
  } {
    const page = searchParams.get('page') || undefined;
    const limit = searchParams.get('limit') || undefined;

    return this.validatePaginationParams(page, limit);
  }

  /**
   * Extract pagination parameters from Next.js request
   */
  static extractPaginationFromRequest(request: Request): {
    page: number;
    limit: number;
    errors: string[];
  } {
    const url = new URL(request.url);
    return this.extractPaginationFromSearchParams(url.searchParams);
  }

  /**
   * Create pagination metadata for empty results
   */
  static createEmptyPagination(
    baseUrl: string,
    queryParams?: Record<string, string>
  ): PaginationMeta {
    return this.calculatePagination({
      page: 1,
      limit: 20,
      total: 0,
      baseUrl,
      queryParams,
    });
  }

  /**
   * Check if pagination is needed
   */
  static isPaginationNeeded(total: number, limit: number): boolean {
    return total > limit;
  }

  /**
   * Get pagination summary text
   */
  static getPaginationSummary(page: number, limit: number, total: number): string {
    if (total === 0) {
      return 'No results found';
    }

    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    return `Showing ${start}-${end} of ${total} results`;
  }
}

/**
 * Utility function to create pagination metadata
 */
export function createPagination(config: PaginationConfig): PaginationMeta {
  return PaginationHelper.calculatePagination(config);
}

/**
 * Utility function to validate pagination parameters
 */
export function validatePagination(page?: string | number, limit?: string | number) {
  return PaginationHelper.validatePaginationParams(page, limit);
}

/**
 * Utility function to extract pagination from request
 */
export function extractPagination(request: Request) {
  return PaginationHelper.extractPaginationFromRequest(request);
}

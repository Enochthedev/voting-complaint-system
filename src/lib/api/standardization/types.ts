/**
 * Core types for API standardization
 */

import { z } from 'zod';

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  data: T | null;
  error: ApiError | null;
  metadata?: ResponseMetadata;
}

/**
 * Enhanced standardized API response wrapper with request IDs and versioning
 */
export interface StandardApiResponse<T = any> {
  data: T | null;
  error: StandardApiError | null;
  meta: ResponseMeta;
}

/**
 * Standard API error format
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * Enhanced standardized API error with consistent type classification
 */
export interface StandardApiError {
  type: ErrorType;
  code: string;
  message: string;
  details?: ErrorDetails;
  context?: ErrorContext;
  timestamp: string;
}

/**
 * Error type classification
 */
export enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  RATE_LIMIT = 'rate_limit',
  SERVER_ERROR = 'server_error',
  NETWORK_ERROR = 'network_error',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

/**
 * Field-level error details for validation errors
 */
export interface ErrorDetails {
  fields?: FieldError[];
  context?: Record<string, any>;
  trace?: string;
  originalError?: any;
}

/**
 * Field-level validation error
 */
export interface FieldError {
  field: string;
  code: string;
  message: string;
  value?: any;
}

/**
 * Error context with sanitized parameters
 */
export interface ErrorContext {
  requestId: string;
  endpoint?: string;
  method?: string;
  userId?: string;
  parameters?: Record<string, any>; // Sanitized parameters
}

/**
 * Response metadata for pagination, caching, etc.
 */
export interface ResponseMetadata {
  pagination?: PaginationInfo;
  cache?: CacheInfo;
  timing?: TimingInfo;
}

/**
 * Enhanced response metadata with request IDs and versioning
 */
export interface ResponseMeta {
  requestId: string;
  timestamp: string;
  version: string;
  timing: TimingInfo;
  pagination?: PaginationMeta;
  cache?: CacheInfo;
}

/**
 * Enhanced pagination metadata with navigation links
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  links: PaginationLinks;
}

/**
 * Pagination navigation links
 */
export interface PaginationLinks {
  first: string;
  prev: string | null;
  next: string | null;
  last: string;
}

/**
 * Paginated API response
 */
export interface PaginatedApiResponse<T> extends StandardApiResponse<T[]> {
  meta: ResponseMeta & {
    pagination: PaginationMeta;
  };
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Cache information
 */
export interface CacheInfo {
  key: string;
  ttl: number;
  hit: boolean;
}

/**
 * Timing information
 */
export interface TimingInfo {
  duration: number;
  timestamp: string;
}

/**
 * Standard request options
 */
export interface RequestOptions {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  rateLimit?: boolean;
  validate?: boolean;
}

/**
 * Validation schema type
 */
export type ValidationSchema = z.ZodSchema<any>;

/**
 * Cache configuration
 */
export interface CacheConfig {
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'fifo';
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: any) => string;
}

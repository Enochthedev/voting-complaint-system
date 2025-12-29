/**
 * API Standardization Core Module
 *
 * Provides standardized patterns for API operations including:
 * - Request/Response formatting
 * - Error handling and recovery
 * - Comprehensive retry system with exponential backoff
 * - Rate limit handling with request queuing
 * - Input/Output validation enforcement
 * - Caching
 * - Request optimization (deduplication, batching)
 * - Enhanced cache management
 * - API monitoring and observability
 * - Performance alerting system
 * - API versioning and backward compatibility
 * - Request lifecycle management with cancellation
 * - Offline request queuing with automatic retry
 */

export * from './types';
export * from './request-formatter';
export * from './response-formatter';
export * from './response-wrapper';
export * from './error-normalizer';
export * from './pagination-helper';
export * from './validation';
export * from './cache';
export * from './rate-limiter';
export * from './rate-limit-handler';
export * from './retry-system';
export * from './client';
export * from './request-deduplicator';
export * from './batch-optimizer';
export * from './enhanced-cache';
export * from './api-monitor';
export * from './performance-alerting';
export * from './monitoring-wrapper';
export * from './version-manager';
export * from './version-router';
export * from './compatibility-layer';
export * from './version-middleware';
export * from './version-utils';
export * from './request-lifecycle';
export * from './offline-queue';
export * from './request-manager';

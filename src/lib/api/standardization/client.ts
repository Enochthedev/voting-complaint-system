/**
 * Standardized API client
 */

import { RetryInstances } from './retry-system';
import { rateLimitHandler } from './rate-limit-handler';
import { RequestFormatter } from './request-formatter';
import { ResponseFormatter } from './response-formatter';
import { ValidationUtils, CommonSchemas } from './validation';
import { globalCache, ApiCache } from './cache';
import { ErrorNormalizer } from './error-normalizer';
import type {
  ApiResponse,
  RequestOptions,
  ValidationSchema,
  CacheConfig,
  RateLimitConfig,
  ErrorContext,
} from './types';

/**
 * Standardized API client configuration
 */
export interface ApiClientConfig {
  baseUrl?: string;
  timeout?: number;
  cache?: Partial<CacheConfig>;
  rateLimit?: RateLimitConfig;
  retries?: number;
  enableValidation?: boolean;
  enableRateLimitHandling?: boolean;
}

/**
 * Standardized API client with enhanced error handling and validation
 */
export class StandardizedApiClient {
  private requestFormatter = new RequestFormatter();
  private responseFormatter = new ResponseFormatter();
  private cache: ApiCache;
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      timeout: 30000,
      retries: 3,
      enableValidation: true,
      enableRateLimitHandling: true,
      ...config,
    };

    this.cache = config.cache ? new ApiCache(config.cache) : globalCache;
  }

  /**
   * Make a standardized API request with comprehensive error handling
   */
  async request<T>(
    operation: () => Promise<any>,
    options: {
      cacheKey?: string;
      cacheTtl?: number;
      rateLimitKey?: string;
      validation?: {
        input?: ValidationSchema;
        output?: ValidationSchema;
      };
      requestOptions?: Partial<RequestOptions>;
      context?: Partial<ErrorContext>;
    } = {}
  ): Promise<ApiResponse<T>> {
    const { cacheKey, cacheTtl, rateLimitKey, validation, requestOptions = {}, context } = options;

    try {
      // Check cache first
      if (cacheKey) {
        const cached = this.cache.get<T>(cacheKey);
        if (cached.data) {
          return this.responseFormatter.success(cached.data, {
            cache: cached.info,
          });
        }
      }

      // Create enhanced operation with validation and error handling
      const enhancedOperation = async () => {
        const startTime = Date.now();

        // Execute with rate limit handling if enabled
        let result;
        if (this.config.enableRateLimitHandling && rateLimitKey) {
          result = await rateLimitHandler.execute(operation, rateLimitKey, 1, context);
        } else {
          // Use retry system for operation
          const retryResult = await RetryInstances.api.execute(operation, context, {
            timeoutMs: requestOptions.timeout || this.config.timeout,
            maxAttempts: requestOptions.retries || this.config.retries,
          });

          if (!retryResult.success) {
            throw new Error(retryResult.error?.message || 'Operation failed');
          }

          result = retryResult.data;
        }

        // Validate output if schema provided and validation enabled
        if (this.config.enableValidation && validation?.output) {
          const validationResult = ValidationUtils.validateWithDetails(
            result,
            validation.output,
            context
          );

          if (!validationResult.success) {
            throw new Error(validationResult.error?.message || 'Output validation failed');
          }

          result = validationResult.data;
        }

        const duration = Date.now() - startTime;

        // Cache result if successful
        if (cacheKey && result) {
          this.cache.set(cacheKey, result, cacheTtl);
        }

        return {
          data: result,
          timing: {
            duration,
            timestamp: new Date().toISOString(),
          },
        };
      };

      const { data, timing } = await enhancedOperation();

      return this.responseFormatter.success(data, {
        timing,
        cache: cacheKey
          ? {
              key: cacheKey,
              ttl: cacheTtl || this.cache.getStats().maxSize,
              hit: false,
            }
          : undefined,
      });
    } catch (error: any) {
      const normalizedError = ErrorNormalizer.normalize(error, context);
      return this.responseFormatter.error<T>(
        normalizedError.code,
        normalizedError.message,
        normalizedError
      );
    }
  }

  /**
   * Make a validated API request with input validation
   */
  async validatedRequest<TInput, TOutput>(
    operation: (input: TInput) => Promise<TOutput>,
    input: unknown,
    options: {
      inputSchema: ValidationSchema;
      outputSchema?: ValidationSchema;
      cacheKey?: string;
      cacheTtl?: number;
      rateLimitKey?: string;
      context?: Partial<ErrorContext>;
    }
  ): Promise<ApiResponse<TOutput>> {
    const { inputSchema, outputSchema, context, ...requestOptions } = options;

    try {
      // Validate and sanitize input
      const validationResult = ValidationUtils.validateAndSanitize<TInput>(
        input,
        inputSchema,
        context
      );

      if (!validationResult.success) {
        return this.responseFormatter.error<TOutput>(
          validationResult.error?.code || 'VALIDATION_ERROR',
          validationResult.error?.message || 'Input validation failed',
          validationResult.error
        );
      }

      const validatedInput = validationResult.data!;

      // Execute request with validated input
      return this.request<TOutput>(() => operation(validatedInput), {
        ...requestOptions,
        validation: { output: outputSchema },
        context,
      });
    } catch (error: any) {
      const normalizedError = ErrorNormalizer.normalize(error, context);
      return this.responseFormatter.error<TOutput>(
        normalizedError.code,
        normalizedError.message,
        normalizedError
      );
    }
  }

  /**
   * Make a paginated request with enhanced error handling
   */
  async paginatedRequest<T>(
    operation: (offset: number, limit: number) => Promise<{ data: T[]; count: number }>,
    page: number = 1,
    limit: number = 20,
    options: {
      cacheKey?: string;
      cacheTtl?: number;
      rateLimitKey?: string;
      validation?: ValidationSchema;
      context?: Partial<ErrorContext>;
    } = {}
  ): Promise<ApiResponse<T[]>> {
    try {
      // Validate pagination parameters
      const paginationValidation = ValidationUtils.validateWithDetails(
        { page, limit },
        ValidationUtils.createSchema({
          page: CommonSchemas.pagination.shape.page,
          limit: CommonSchemas.pagination.shape.limit,
        }),
        options.context
      );

      if (!paginationValidation.success) {
        return this.responseFormatter.error<T[]>(
          paginationValidation.error?.code || 'VALIDATION_ERROR',
          paginationValidation.error?.message || 'Pagination validation failed',
          paginationValidation.error
        );
      }

      const { page: validPage, limit: validLimit } = paginationValidation.data as {
        page: number;
        limit: number;
      };
      const paginationParams = this.requestFormatter.createPaginationParams(validPage, validLimit);

      const cacheKey = options.cacheKey
        ? `${options.cacheKey}:${validPage}:${validLimit}`
        : undefined;

      const response = await this.request<{ data: T[]; count: number }>(
        () => operation(paginationParams.offset, paginationParams.limit),
        {
          ...options,
          cacheKey,
          validation: options.validation ? { output: options.validation } : undefined,
        }
      );

      if (response.error) {
        return {
          data: null as unknown as T[],
          error: response.error,
          metadata: response.metadata,
        };
      }

      const pagination = this.responseFormatter.calculatePagination(
        response.data?.count || 0,
        validPage,
        validLimit
      );

      return this.responseFormatter.paginated(
        response.data?.data || [],
        pagination,
        response.metadata
      );
    } catch (error: any) {
      const normalizedError = ErrorNormalizer.normalize(error, options.context);
      return this.responseFormatter.error<T[]>(
        normalizedError.code,
        normalizedError.message,
        normalizedError
      );
    }
  }

  /**
   * Execute external API call with validation
   */
  async externalApiCall<T>(
    operation: () => Promise<any>,
    options: {
      expectedSchema?: ValidationSchema;
      context?: Partial<ErrorContext>;
      rateLimitKey?: string;
    } = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.request<any>(operation, {
        rateLimitKey: options.rateLimitKey,
        context: options.context,
      });

      if (response.error) {
        return response as ApiResponse<T>;
      }

      // Validate external API response
      const validationResult = ValidationUtils.validateExternalApiResponse(
        response.data,
        options.expectedSchema,
        options.context
      );

      if (!validationResult.success) {
        return this.responseFormatter.error<T>(
          validationResult.error?.code || 'EXTERNAL_API_ERROR',
          validationResult.error?.message || 'External API validation failed',
          validationResult.error
        );
      }

      return this.responseFormatter.success(validationResult.data, response.metadata);
    } catch (error: any) {
      const normalizedError = ErrorNormalizer.normalize(error, options.context);
      return this.responseFormatter.error<T>(
        normalizedError.code,
        normalizedError.message,
        normalizedError
      );
    }
  }

  /**
   * Clear cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Get rate limit information
   */
  getRateLimitInfo(key?: string) {
    return rateLimitHandler.getRateLimitStatus(key || 'default');
  }

  /**
   * Get queue information
   */
  getQueueInfo(key?: string) {
    return rateLimitHandler.getQueueInfo(key || 'default');
  }
}

/**
 * Default standardized API client instance
 */
export const apiClient = new StandardizedApiClient();

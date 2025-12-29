/**
 * Validation utilities for API standardization
 */

import { z } from 'zod';
import { ErrorNormalizer } from './error-normalizer';
import type { ValidationSchema, StandardApiError, ErrorContext, FieldError } from './types';

/**
 * Validation result with detailed error information
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: StandardApiError;
}

/**
 * External API response validation schema
 */
export interface ExternalApiResponse {
  status: number;
  data: any;
  headers?: Record<string, string>;
}

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  /**
   * Pagination schema
   */
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  }),

  /**
   * ID schema
   */
  id: z.string().uuid(),

  /**
   * Search schema
   */
  search: z.object({
    query: z.string().min(1).max(255),
    filters: z.record(z.string(), z.any()).optional(),
    sort: z
      .object({
        field: z.string(),
        order: z.enum(['asc', 'desc']).default('asc'),
      })
      .optional(),
  }),

  /**
   * Date range schema
   */
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),

  /**
   * External API response schema
   */
  externalApiResponse: z.object({
    status: z.number().int().min(100).max(599),
    data: z.any(),
    headers: z.record(z.string(), z.string()).optional(),
  }),

  /**
   * File upload schema
   */
  fileUpload: z.object({
    name: z.string().min(1).max(255),
    size: z
      .number()
      .int()
      .min(1)
      .max(50 * 1024 * 1024), // 50MB max
    type: z.string().min(1),
    content: z.any(),
  }),

  /**
   * Email schema
   */
  email: z.string().email(),

  /**
   * URL schema
   */
  url: z.string().url(),

  /**
   * Phone number schema (basic)
   */
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format'),

  /**
   * Password schema
   */
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    ),
};

/**
 * Enhanced validation utilities with comprehensive error handling
 */
export class ValidationUtils {
  /**
   * Validate data against schema with detailed error reporting
   */
  static validateWithDetails<T>(
    data: unknown,
    schema: ValidationSchema,
    context?: Partial<ErrorContext>
  ): ValidationResult<T> {
    try {
      const result = schema.safeParse(data);

      if (!result.success) {
        const fieldErrors: FieldError[] = result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          code: issue.code,
          message: issue.message,
          value: 'received' in issue ? issue.received : undefined,
        }));

        const error = ErrorNormalizer.createValidationError(
          fieldErrors,
          context,
          `Validation failed: ${fieldErrors.length} field(s) have errors`
        );

        return {
          success: false,
          error,
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: ErrorNormalizer.normalize(error, context),
      };
    }
  }

  /**
   * Validate data against schema (throws on error for backward compatibility)
   */
  static validate<T>(data: unknown, schema: ValidationSchema): T {
    const result = this.validateWithDetails<T>(data, schema);

    if (!result.success) {
      throw new Error(result.error?.message || 'Validation failed');
    }

    return result.data!;
  }

  /**
   * Validate external API response
   */
  static validateExternalApiResponse(
    response: unknown,
    expectedSchema?: ValidationSchema,
    context?: Partial<ErrorContext>
  ): ValidationResult<any> {
    // First validate the response structure
    const responseValidation = this.validateWithDetails(
      response,
      CommonSchemas.externalApiResponse,
      context
    );

    if (!responseValidation.success) {
      return responseValidation;
    }

    const apiResponse = responseValidation.data as ExternalApiResponse;

    // Check HTTP status
    if (apiResponse.status >= 400) {
      return {
        success: false,
        error: ErrorNormalizer.normalize(
          {
            status: apiResponse.status,
            message: `External API error: HTTP ${apiResponse.status}`,
            data: apiResponse.data,
          },
          context
        ),
      };
    }

    // Validate response data if schema provided
    if (expectedSchema) {
      return this.validateWithDetails(apiResponse.data, expectedSchema, context);
    }

    return {
      success: true,
      data: apiResponse.data,
    };
  }

  /**
   * Validate and format field errors with detailed information
   */
  static formatValidationErrors(
    zodError: z.ZodError,
    context?: Partial<ErrorContext>
  ): StandardApiError {
    const fieldErrors: FieldError[] = zodError.issues.map((issue) => {
      let message = issue.message;

      // Enhance error messages with more context
      if (issue.code === 'invalid_type') {
        const invalidTypeIssue = issue as any;
        message = `Expected ${invalidTypeIssue.expected}, but received ${invalidTypeIssue.received}`;
      } else if (issue.code === 'too_small') {
        const tooSmallIssue = issue as any;
        if (tooSmallIssue.type === 'string') {
          message = `Must be at least ${tooSmallIssue.minimum} characters long`;
        } else if (tooSmallIssue.type === 'number') {
          message = `Must be at least ${tooSmallIssue.minimum}`;
        } else if (tooSmallIssue.type === 'array') {
          message = `Must contain at least ${tooSmallIssue.minimum} items`;
        }
      } else if (issue.code === 'too_big') {
        const tooBigIssue = issue as any;
        if (tooBigIssue.type === 'string') {
          message = `Must be at most ${tooBigIssue.maximum} characters long`;
        } else if (tooBigIssue.type === 'number') {
          message = `Must be at most ${tooBigIssue.maximum}`;
        } else if (tooBigIssue.type === 'array') {
          message = `Must contain at most ${tooBigIssue.maximum} items`;
        }
      }

      return {
        field: issue.path.join('.') || 'root',
        code: issue.code,
        message,
        value: 'received' in issue ? issue.received : undefined,
      };
    });

    return ErrorNormalizer.createValidationError(
      fieldErrors,
      context,
      `Validation failed: ${fieldErrors.length} field(s) have errors`
    );
  }

  /**
   * Validate pagination parameters
   */
  static validatePagination(params: unknown) {
    return this.validate(params, CommonSchemas.pagination);
  }

  /**
   * Validate ID parameter
   */
  static validateId(id: unknown) {
    return this.validate(id, CommonSchemas.id);
  }

  /**
   * Validate search parameters
   */
  static validateSearch(params: unknown) {
    return this.validate(params, CommonSchemas.search);
  }

  /**
   * Validate date range
   */
  static validateDateRange(params: unknown) {
    return this.validate(params, CommonSchemas.dateRange);
  }

  /**
   * Validate file upload
   */
  static validateFileUpload(file: unknown) {
    return this.validate(file, CommonSchemas.fileUpload);
  }

  /**
   * Validate email
   */
  static validateEmail(email: unknown) {
    return this.validate(email, CommonSchemas.email);
  }

  /**
   * Validate URL
   */
  static validateUrl(url: unknown) {
    return this.validate(url, CommonSchemas.url);
  }

  /**
   * Validate password
   */
  static validatePassword(password: unknown) {
    return this.validate(password, CommonSchemas.password);
  }

  /**
   * Create custom validation schema
   */
  static createSchema<T>(schemaDefinition: z.ZodRawShape): z.ZodObject<z.ZodRawShape> {
    return z.object(schemaDefinition);
  }

  /**
   * Sanitize input data recursively
   */
  static sanitize(data: any): any {
    if (typeof data === 'string') {
      return data.trim();
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }

    if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitize(value);
      }
      return sanitized;
    }

    return data;
  }

  /**
   * Validate and sanitize input data
   */
  static validateAndSanitize<T>(
    data: unknown,
    schema: ValidationSchema,
    context?: Partial<ErrorContext>
  ): ValidationResult<T> {
    // First sanitize the data
    const sanitizedData = this.sanitize(data);

    // Then validate
    return this.validateWithDetails<T>(sanitizedData, schema, context);
  }

  /**
   * Create a validation middleware function
   */
  static createValidator<T>(
    schema: ValidationSchema,
    options: {
      sanitize?: boolean;
      context?: Partial<ErrorContext>;
    } = {}
  ) {
    return (data: unknown): T => {
      const { sanitize = true, context } = options;

      if (sanitize) {
        const result = this.validateAndSanitize<T>(data, schema, context);
        if (!result.success) {
          throw new Error(result.error?.message || 'Validation failed');
        }
        return result.data!;
      } else {
        return this.validate<T>(data, schema);
      }
    };
  }

  /**
   * Batch validate multiple inputs
   */
  static batchValidate(
    validations: Array<{
      data: unknown;
      schema: ValidationSchema;
      name: string;
    }>,
    context?: Partial<ErrorContext>
  ): ValidationResult<Record<string, any>> {
    const results: Record<string, any> = {};
    const errors: FieldError[] = [];

    for (const { data, schema, name } of validations) {
      const result = this.validateWithDetails(data, schema, context);

      if (result.success) {
        results[name] = result.data;
      } else {
        // Prefix field names with validation name
        const prefixedErrors =
          result.error?.details?.fields?.map((error) => ({
            ...error,
            field: `${name}.${error.field}`,
          })) || [];

        errors.push(...prefixedErrors);
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: ErrorNormalizer.createValidationError(
          errors,
          context,
          `Batch validation failed: ${errors.length} field(s) have errors`
        ),
      };
    }

    return {
      success: true,
      data: results,
    };
  }
}

/**
 * Validation enforcement decorator for API functions
 */
export function validateInput<T>(
  schema: ValidationSchema,
  options: {
    sanitize?: boolean;
    context?: Partial<ErrorContext>;
  } = {}
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // Validate the first argument (assumed to be input data)
      if (args.length > 0) {
        const validator = ValidationUtils.createValidator<T>(schema, options);
        args[0] = validator(args[0]);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Validation enforcement for external API responses
 */
export function validateExternalResponse(
  schema?: ValidationSchema,
  options: {
    context?: Partial<ErrorContext>;
  } = {}
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);

      const validation = ValidationUtils.validateExternalApiResponse(
        result,
        schema,
        options.context
      );

      if (!validation.success) {
        throw new Error(validation.error?.message || 'External API response validation failed');
      }

      return validation.data;
    };

    return descriptor;
  };
}

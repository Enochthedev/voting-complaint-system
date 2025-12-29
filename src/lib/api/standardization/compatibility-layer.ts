/**
 * Backward Compatibility Layer for API Versioning
 *
 * Provides transformation utilities and compatibility handlers for different API versions
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiVersion, ApiVersionManager } from './version-manager';
import type { StandardApiResponse, PaginatedApiResponse } from './types';

/**
 * Data transformation interface
 */
export interface DataTransformer<TFrom = any, TTo = any> {
  transform(data: TFrom, context?: TransformationContext): TTo;
  canTransform(fromVersion: ApiVersion, toVersion: ApiVersion): boolean;
}

/**
 * Transformation context
 */
export interface TransformationContext {
  requestId: string;
  originalVersion: ApiVersion;
  targetVersion: ApiVersion;
  endpoint: string;
  method: string;
  preserveMetadata?: boolean;
}

/**
 * Field mapping configuration
 */
export interface FieldMapping {
  from: string;
  to: string;
  transform?: (value: any) => any;
  required?: boolean;
  defaultValue?: any;
}

/**
 * Version compatibility configuration
 */
export interface CompatibilityConfig {
  fromVersion: ApiVersion;
  toVersion: ApiVersion;
  fieldMappings: FieldMapping[];
  removedFields: string[];
  addedFields: { field: string; defaultValue: any }[];
  customTransformers: Record<string, (data: any) => any>;
}

/**
 * Backward Compatibility Manager
 */
export class CompatibilityManager {
  private static transformers: Map<string, DataTransformer> = new Map();
  private static configs: Map<string, CompatibilityConfig> = new Map();

  /**
   * Register data transformer
   */
  static registerTransformer(key: string, transformer: DataTransformer): void {
    this.transformers.set(key, transformer);
  }

  /**
   * Register compatibility configuration
   */
  static registerConfig(key: string, config: CompatibilityConfig): void {
    this.configs.set(key, config);
  }

  /**
   * Transform data between versions
   */
  static transformData<TFrom, TTo>(
    data: TFrom,
    fromVersion: ApiVersion,
    toVersion: ApiVersion,
    context: Partial<TransformationContext> = {}
  ): TTo {
    const transformerKey = `${fromVersion}-to-${toVersion}`;
    const transformer = this.transformers.get(transformerKey);

    if (transformer && transformer.canTransform(fromVersion, toVersion)) {
      return transformer.transform(data, context as TransformationContext);
    }

    // Use configuration-based transformation
    const config = this.configs.get(transformerKey);
    if (config) {
      return this.applyConfigTransformation(data, config, context) as TTo;
    }

    // Fallback to default transformation
    return this.defaultTransformation(data, fromVersion, toVersion) as TTo;
  }

  /**
   * Apply configuration-based transformation
   */
  private static applyConfigTransformation(
    data: any,
    config: CompatibilityConfig,
    context: Partial<TransformationContext>
  ): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.applyConfigTransformation(item, config, context));
    }

    const transformed = { ...data };

    // Apply field mappings
    config.fieldMappings.forEach((mapping) => {
      if (data.hasOwnProperty(mapping.from)) {
        const value = mapping.transform
          ? mapping.transform(data[mapping.from])
          : data[mapping.from];

        transformed[mapping.to] = value;

        // Remove original field if it's different from target
        if (mapping.from !== mapping.to) {
          delete transformed[mapping.from];
        }
      } else if (mapping.required && mapping.defaultValue !== undefined) {
        transformed[mapping.to] = mapping.defaultValue;
      }
    });

    // Remove deprecated fields
    config.removedFields.forEach((field) => {
      delete transformed[field];
    });

    // Add new fields with default values
    config.addedFields.forEach(({ field, defaultValue }) => {
      if (!transformed.hasOwnProperty(field)) {
        transformed[field] = defaultValue;
      }
    });

    // Apply custom transformers
    Object.entries(config.customTransformers).forEach(([field, transformer]) => {
      if (transformed.hasOwnProperty(field)) {
        transformed[field] = transformer(transformed[field]);
      }
    });

    return transformed;
  }

  /**
   * Default transformation fallback
   */
  private static defaultTransformation(
    data: any,
    fromVersion: ApiVersion,
    toVersion: ApiVersion
  ): any {
    // Use ApiVersionManager's built-in compatibility
    return ApiVersionManager.createCompatibilityResponse(data, fromVersion, toVersion);
  }

  /**
   * Transform API response
   */
  static transformResponse<T>(
    response: StandardApiResponse<T>,
    fromVersion: ApiVersion,
    toVersion: ApiVersion,
    context: Partial<TransformationContext> = {}
  ): StandardApiResponse<T> {
    const transformedData = response.data
      ? this.transformData(response.data, fromVersion, toVersion, context)
      : null;

    return {
      ...response,
      data: transformedData,
      meta: {
        ...response.meta,
        version: toVersion,
      },
    };
  }

  /**
   * Transform paginated response
   */
  static transformPaginatedResponse<T>(
    response: PaginatedApiResponse<T>,
    fromVersion: ApiVersion,
    toVersion: ApiVersion,
    context: Partial<TransformationContext> = {}
  ): PaginatedApiResponse<T> {
    const transformedData = response.data
      ? response.data.map((item) => this.transformData(item, fromVersion, toVersion, context))
      : [];

    return {
      ...response,
      data: transformedData,
      meta: {
        ...response.meta,
        version: toVersion,
      },
    };
  }
}

/**
 * V1 to V2 Data Transformer
 */
export class V1ToV2Transformer implements DataTransformer {
  canTransform(fromVersion: ApiVersion, toVersion: ApiVersion): boolean {
    return fromVersion === ApiVersion.V1 && toVersion === ApiVersion.V2;
  }

  transform(data: any, context?: TransformationContext): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.transform(item, context));
    }

    const transformed = { ...data };

    // Add V2-specific fields
    transformed.enhanced_metadata = {
      version: ApiVersion.V2,
      compatibility_mode: true,
      original_version: ApiVersion.V1,
      transformation_timestamp: new Date().toISOString(),
    };

    // Transform date fields to ISO format
    if (transformed.created_at && !transformed.created_at_iso) {
      transformed.created_at_iso = new Date(transformed.created_at).toISOString();
    }

    if (transformed.updated_at && !transformed.updated_at_iso) {
      transformed.updated_at_iso = new Date(transformed.updated_at).toISOString();
    }

    // Add default values for new V2 fields
    if (!transformed.status_history) {
      transformed.status_history = [];
    }

    if (!transformed.tags && transformed.category) {
      transformed.tags = [transformed.category];
    }

    // Transform nested objects
    if (transformed.metadata && typeof transformed.metadata === 'object') {
      transformed.metadata = {
        ...transformed.metadata,
        enhanced: true,
        compatibility_source: 'v1',
      };
    }

    return transformed;
  }
}

/**
 * V2 to V1 Data Transformer
 */
export class V2ToV1Transformer implements DataTransformer {
  canTransform(fromVersion: ApiVersion, toVersion: ApiVersion): boolean {
    return fromVersion === ApiVersion.V2 && toVersion === ApiVersion.V1;
  }

  transform(data: any, context?: TransformationContext): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.transform(item, context));
    }

    const transformed = { ...data };

    // Remove V2-only fields
    const v2OnlyFields = [
      'enhanced_metadata',
      'status_history',
      'real_time_updates',
      'bulk_operations',
      'advanced_search_score',
      'created_at_iso',
      'updated_at_iso',
    ];

    v2OnlyFields.forEach((field) => {
      delete transformed[field];
    });

    // Transform date fields back to V1 format
    if (transformed.created_at_iso) {
      transformed.created_at = transformed.created_at_iso;
    }

    if (transformed.updated_at_iso) {
      transformed.updated_at = transformed.updated_at_iso;
    }

    // Simplify tags to category for V1
    if (transformed.tags && Array.isArray(transformed.tags) && transformed.tags.length > 0) {
      transformed.category = transformed.tags[0];
      delete transformed.tags;
    }

    // Simplify metadata for V1
    if (transformed.metadata && typeof transformed.metadata === 'object') {
      transformed.metadata = {
        id: transformed.metadata.id || null,
        type: transformed.metadata.type || 'unknown',
      };
    }

    return transformed;
  }
}

/**
 * Complaints-specific compatibility configurations
 */
export const ComplaintsCompatibilityConfigs: Record<string, CompatibilityConfig> = {
  'v1-to-v2': {
    fromVersion: ApiVersion.V1,
    toVersion: ApiVersion.V2,
    fieldMappings: [
      {
        from: 'created_at',
        to: 'created_at_iso',
        transform: (date) => new Date(date).toISOString(),
      },
      {
        from: 'updated_at',
        to: 'updated_at_iso',
        transform: (date) => new Date(date).toISOString(),
      },
      { from: 'category', to: 'tags', transform: (category) => [category] },
    ],
    removedFields: [],
    addedFields: [
      { field: 'enhanced_metadata', defaultValue: { version: 'v2', compatibility_mode: true } },
      { field: 'status_history', defaultValue: [] },
    ],
    customTransformers: {
      priority: (value) => value || 'medium',
      visibility: (value) => value || 'public',
    },
  },
  'v2-to-v1': {
    fromVersion: ApiVersion.V2,
    toVersion: ApiVersion.V1,
    fieldMappings: [
      { from: 'created_at_iso', to: 'created_at' },
      { from: 'updated_at_iso', to: 'updated_at' },
      { from: 'tags', to: 'category', transform: (tags) => (Array.isArray(tags) ? tags[0] : null) },
    ],
    removedFields: [
      'enhanced_metadata',
      'status_history',
      'real_time_updates',
      'bulk_operations',
      'advanced_search_score',
    ],
    addedFields: [],
    customTransformers: {},
  },
};

/**
 * Initialize compatibility system
 */
export function initializeCompatibilitySystem(): void {
  // Register transformers
  CompatibilityManager.registerTransformer('v1-to-v2', new V1ToV2Transformer());
  CompatibilityManager.registerTransformer('v2-to-v1', new V2ToV1Transformer());

  // Register configurations
  Object.entries(ComplaintsCompatibilityConfigs).forEach(([key, config]) => {
    CompatibilityManager.registerConfig(key, config);
  });
}

/**
 * Create compatibility middleware
 */
export function createCompatibilityMiddleware(): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest): Promise<NextResponse> => {
    const versionResult = ApiVersionManager.detectVersion(request);

    // Add compatibility headers
    const response = NextResponse.next();
    response.headers.set('X-Compatibility-Layer', 'enabled');
    response.headers.set('X-Detected-Version', versionResult.version);

    if (versionResult.config.isDeprecated) {
      response.headers.set('X-Deprecation-Warning', 'This API version is deprecated');
    }

    return response;
  };
}

/**
 * Wrap response with compatibility transformation
 */
export async function wrapWithCompatibility<T>(
  response: Response,
  targetVersion: ApiVersion,
  context: Partial<TransformationContext> = {}
): Promise<Response> {
  if (!response.headers.get('content-type')?.includes('application/json')) {
    return response;
  }

  try {
    const data = await response.json();
    const currentVersion = (response.headers.get('X-API-Version') as ApiVersion) || ApiVersion.V2;

    if (currentVersion === targetVersion) {
      return response;
    }

    // Transform data for compatibility
    const transformedData = CompatibilityManager.transformData(
      data,
      currentVersion,
      targetVersion,
      context
    );

    // Create new response with transformed data
    return new Response(JSON.stringify(transformedData), {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'X-API-Version': targetVersion,
        'X-Original-Version': currentVersion,
        'X-Compatibility-Transform': 'applied',
      },
    });
  } catch (error) {
    console.error('Compatibility transformation error:', error);
    return response;
  }
}

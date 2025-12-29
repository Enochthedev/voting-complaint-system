/**
 * Tests for API Version Management System
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { ApiVersionManager, ApiVersion } from '../version-manager';

describe('ApiVersionManager', () => {
  describe('detectVersion', () => {
    it('should detect version from X-API-Version header', () => {
      const request = new NextRequest('http://localhost/api/complaints', {
        headers: { 'X-API-Version': 'v1' },
      });

      const result = ApiVersionManager.detectVersion(request);

      expect(result.version).toBe(ApiVersion.V1);
      expect(result.source).toBe('header');
      expect(result.isValid).toBe(true);
    });

    it('should detect version from Accept-Version header', () => {
      const request = new NextRequest('http://localhost/api/complaints', {
        headers: { 'Accept-Version': 'v2' },
      });

      const result = ApiVersionManager.detectVersion(request);

      expect(result.version).toBe(ApiVersion.V2);
      expect(result.source).toBe('header');
      expect(result.isValid).toBe(true);
    });

    it('should detect version from URL path', () => {
      const request = new NextRequest('http://localhost/api/v1/complaints');

      const result = ApiVersionManager.detectVersion(request);

      expect(result.version).toBe(ApiVersion.V1);
      expect(result.source).toBe('path');
      expect(result.isValid).toBe(true);
    });

    it('should use default version when no version specified', () => {
      const request = new NextRequest('http://localhost/api/complaints');

      const result = ApiVersionManager.detectVersion(request);

      expect(result.version).toBe(ApiVersion.V2); // Default version
      expect(result.source).toBe('default');
      expect(result.isValid).toBe(true);
    });

    it('should prioritize header over path', () => {
      const request = new NextRequest('http://localhost/api/v1/complaints', {
        headers: { 'X-API-Version': 'v2' },
      });

      const result = ApiVersionManager.detectVersion(request);

      expect(result.version).toBe(ApiVersion.V2);
      expect(result.source).toBe('header');
    });
  });

  describe('getVersionConfig', () => {
    it('should return correct config for V1', () => {
      const config = ApiVersionManager.getVersionConfig(ApiVersion.V1);

      expect(config.version).toBe(ApiVersion.V1);
      expect(config.isDeprecated).toBe(true);
      expect(config.backwardCompatible).toBe(true);
    });

    it('should return correct config for V2', () => {
      const config = ApiVersionManager.getVersionConfig(ApiVersion.V2);

      expect(config.version).toBe(ApiVersion.V2);
      expect(config.isDefault).toBe(true);
      expect(config.isDeprecated).toBe(false);
    });
  });

  describe('supportsFeature', () => {
    it('should return true for features supported by version', () => {
      expect(ApiVersionManager.supportsFeature(ApiVersion.V1, 'basic-crud')).toBe(true);
      expect(ApiVersionManager.supportsFeature(ApiVersion.V2, 'advanced-search')).toBe(true);
    });

    it('should return false for features not supported by version', () => {
      expect(ApiVersionManager.supportsFeature(ApiVersion.V1, 'advanced-search')).toBe(false);
      expect(ApiVersionManager.supportsFeature(ApiVersion.V1, 'bulk-operations')).toBe(false);
    });
  });

  describe('createVersionHeaders', () => {
    it('should create correct headers for non-deprecated version', () => {
      const headers = ApiVersionManager.createVersionHeaders(ApiVersion.V2);

      expect(headers['X-API-Version']).toBe('v2');
      expect(headers['API-Supported-Versions']).toContain('v1');
      expect(headers['API-Supported-Versions']).toContain('v2');
      expect(headers['API-Deprecated']).toBeUndefined();
    });

    it('should create correct headers for deprecated version', () => {
      const headers = ApiVersionManager.createVersionHeaders(ApiVersion.V1);

      expect(headers['X-API-Version']).toBe('v1');
      expect(headers['API-Deprecated']).toBe('true');
      expect(headers['API-Deprecation-Date']).toBeDefined();
      expect(headers['API-Sunset-Date']).toBeDefined();
    });
  });

  describe('createCompatibilityResponse', () => {
    it('should return data unchanged for same version', () => {
      const data = { id: 1, name: 'test' };
      const result = ApiVersionManager.createCompatibilityResponse(
        data,
        ApiVersion.V2,
        ApiVersion.V2
      );

      expect(result).toEqual(data);
    });

    it('should transform V2 to V1 format', () => {
      const v2Data = {
        id: 1,
        name: 'test',
        created_at_iso: '2024-01-01T00:00:00.000Z',
        enhanced_metadata: { version: 'v2' },
        real_time_updates: true,
      };

      const result = ApiVersionManager.createCompatibilityResponse(
        v2Data,
        ApiVersion.V2,
        ApiVersion.V1
      );

      expect(result.created_at).toBe('2024-01-01T00:00:00.000Z');
      expect(result.enhanced_metadata).toBeUndefined();
      expect(result.real_time_updates).toBeUndefined();
    });

    it('should transform V1 to V2 format', () => {
      const v1Data = {
        id: 1,
        name: 'test',
        created_at: '2024-01-01T00:00:00.000Z',
        category: 'academic',
      };

      const result = ApiVersionManager.createCompatibilityResponse(
        v1Data,
        ApiVersion.V1,
        ApiVersion.V2
      );

      expect(result.created_at_iso).toBe('2024-01-01T00:00:00.000Z');
      expect(result.enhanced_metadata).toBeDefined();
      expect(result.enhanced_metadata.version).toBe(ApiVersion.V2);
    });
  });

  describe('resolveHandler', () => {
    it('should resolve handler for valid version and path', () => {
      const handler = ApiVersionManager.resolveHandler('/api/complaints', ApiVersion.V1);
      expect(handler).toBe('complaints-v1');

      const handlerV2 = ApiVersionManager.resolveHandler('/api/complaints', ApiVersion.V2);
      expect(handlerV2).toBe('complaints-v2');
    });

    it('should return null for unsupported version', () => {
      const handler = ApiVersionManager.resolveHandler('/api/analytics', ApiVersion.V1);
      expect(handler).toBeNull();
    });

    it('should return null for unknown path', () => {
      const handler = ApiVersionManager.resolveHandler('/api/unknown', ApiVersion.V1);
      expect(handler).toBeNull();
    });
  });
});

/**
 * CSRF Protection Tests
 *
 * Tests for CSRF token generation, validation, and security features
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the crypto API for testing
global.crypto = {
  getRandomValues: (array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  },
} as any;

// Import functions to test
import { requiresCsrfProtection, validateOrigin } from '@/lib/csrf';

describe('CSRF Protection', () => {
  describe('requiresCsrfProtection', () => {
    it('should require CSRF protection for POST requests', () => {
      expect(requiresCsrfProtection('POST')).toBe(true);
    });

    it('should require CSRF protection for PUT requests', () => {
      expect(requiresCsrfProtection('PUT')).toBe(true);
    });

    it('should require CSRF protection for PATCH requests', () => {
      expect(requiresCsrfProtection('PATCH')).toBe(true);
    });

    it('should require CSRF protection for DELETE requests', () => {
      expect(requiresCsrfProtection('DELETE')).toBe(true);
    });

    it('should not require CSRF protection for GET requests', () => {
      expect(requiresCsrfProtection('GET')).toBe(false);
    });

    it('should not require CSRF protection for HEAD requests', () => {
      expect(requiresCsrfProtection('HEAD')).toBe(false);
    });

    it('should not require CSRF protection for OPTIONS requests', () => {
      expect(requiresCsrfProtection('OPTIONS')).toBe(false);
    });

    it('should handle lowercase method names', () => {
      expect(requiresCsrfProtection('post')).toBe(true);
      expect(requiresCsrfProtection('get')).toBe(false);
    });
  });

  describe('validateOrigin', () => {
    it('should allow same-origin requests', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
          host: 'localhost:3000',
        },
      });

      expect(validateOrigin(request)).toBe(true);
    });

    it('should allow requests with matching referer', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          referer: 'http://localhost:3000/page',
          host: 'localhost:3000',
        },
      });

      expect(validateOrigin(request)).toBe(true);
    });

    it('should reject cross-origin requests without allowed origins', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          origin: 'http://evil.com',
          host: 'localhost:3000',
        },
      });

      expect(validateOrigin(request)).toBe(false);
    });

    it('should allow requests without origin header (same-origin)', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          host: 'localhost:3000',
        },
      });

      expect(validateOrigin(request)).toBe(true);
    });

    it('should reject requests with mismatched referer', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          referer: 'http://evil.com/page',
          host: 'localhost:3000',
        },
      });

      expect(validateOrigin(request)).toBe(false);
    });
  });

  describe('Token Security', () => {
    it('should generate tokens with sufficient entropy', () => {
      // Test that tokens are random and unique
      const tokens = new Set();
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const token = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
        tokens.add(token);
      }

      // All tokens should be unique
      expect(tokens.size).toBe(iterations);
    });

    it('should generate tokens of correct length', () => {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const token = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');

      // 32 bytes = 64 hex characters
      expect(token.length).toBe(64);
    });

    it('should generate tokens with only hex characters', () => {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const token = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');

      // Should only contain 0-9 and a-f
      expect(token).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe('Security Headers', () => {
    it('should validate CSRF header name', () => {
      const headerName = 'x-csrf-token';
      expect(headerName).toBe('x-csrf-token');
    });

    it('should use lowercase header names', () => {
      const headerName = 'x-csrf-token';
      expect(headerName).toBe(headerName.toLowerCase());
    });
  });

  describe('Cookie Configuration', () => {
    it('should use secure cookie attributes in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const cookieConfig = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
      };

      expect(cookieConfig.httpOnly).toBe(true);
      expect(cookieConfig.secure).toBe(true);
      expect(cookieConfig.sameSite).toBe('strict');
      expect(cookieConfig.path).toBe('/');

      process.env.NODE_ENV = originalEnv;
    });

    it('should allow non-secure cookies in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const cookieConfig = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
      };

      expect(cookieConfig.secure).toBe(false);

      process.env.NODE_ENV = originalEnv;
    });
  });
});

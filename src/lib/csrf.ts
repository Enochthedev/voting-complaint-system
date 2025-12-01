/**
 * CSRF Protection Utilities
 *
 * This module provides Cross-Site Request Forgery (CSRF) protection
 * for the Student Complaint Resolution System using the double-submit
 * cookie pattern and token validation.
 *
 * Security Features:
 * - CSRF token generation and validation
 * - Double-submit cookie pattern
 * - Cryptographically secure random tokens
 * - Token expiration
 * - Origin/Referer validation
 */

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

/**
 * CSRF token configuration
 */
const CSRF_TOKEN_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Generate a cryptographically secure random token
 *
 * @returns Random token string
 */
function generateSecureToken(): string {
  // Use Web Crypto API for cryptographically secure random values
  const array = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a CSRF token and store it in a cookie
 *
 * @returns CSRF token string
 */
export async function generateCsrfToken(): Promise<string> {
  const token = generateSecureToken();
  const cookieStore = await cookies();

  // Store token in HTTP-only cookie with secure attributes
  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: CSRF_TOKEN_EXPIRY / 1000, // Convert to seconds
  });

  return token;
}

/**
 * Get the current CSRF token from cookies
 *
 * @returns CSRF token or null if not found
 */
export async function getCsrfToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CSRF_TOKEN_NAME);
  return token?.value || null;
}

/**
 * Validate CSRF token from request
 *
 * Checks that the token in the request header matches the token in the cookie.
 * This implements the double-submit cookie pattern.
 *
 * @param request - Next.js request object
 * @returns True if token is valid, false otherwise
 */
export async function validateCsrfToken(request: NextRequest): Promise<boolean> {
  // Get token from cookie
  const cookieToken = request.cookies.get(CSRF_TOKEN_NAME)?.value;

  if (!cookieToken) {
    console.warn('CSRF validation failed: No token in cookie');
    return false;
  }

  // Get token from header
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!headerToken) {
    console.warn('CSRF validation failed: No token in header');
    return false;
  }

  // Compare tokens using constant-time comparison to prevent timing attacks
  if (!constantTimeCompare(cookieToken, headerToken)) {
    console.warn('CSRF validation failed: Token mismatch');
    return false;
  }

  return true;
}

/**
 * Constant-time string comparison to prevent timing attacks
 *
 * @param a - First string
 * @param b - Second string
 * @returns True if strings are equal, false otherwise
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Validate request origin
 *
 * Checks that the request comes from an allowed origin to prevent
 * cross-origin attacks.
 *
 * @param request - Next.js request object
 * @returns True if origin is valid, false otherwise
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Get allowed origins from environment or use request host
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  const requestHost = request.headers.get('host');

  // If no origin header (same-origin request), check referer
  if (!origin) {
    if (!referer) {
      // No origin or referer - could be a direct request or API call
      // Allow if it's from the same host
      return true;
    }

    // Check referer matches our host
    try {
      const refererUrl = new URL(referer);
      return refererUrl.host === requestHost;
    } catch {
      console.warn('CSRF validation failed: Invalid referer URL');
      return false;
    }
  }

  // Check if origin is in allowed list or matches request host
  try {
    const originUrl = new URL(origin);

    // Allow same-origin requests
    if (originUrl.host === requestHost) {
      return true;
    }

    // Check against allowed origins list
    if (allowedOrigins.length > 0) {
      return allowedOrigins.some((allowed) => {
        try {
          const allowedUrl = new URL(allowed);
          return allowedUrl.host === originUrl.host;
        } catch {
          return false;
        }
      });
    }

    // If no allowed origins configured, only allow same-origin
    console.warn('CSRF validation failed: Cross-origin request not allowed');
    return false;
  } catch {
    console.warn('CSRF validation failed: Invalid origin URL');
    return false;
  }
}

/**
 * Check if request method requires CSRF protection
 *
 * @param method - HTTP method
 * @returns True if method requires CSRF protection
 */
export function requiresCsrfProtection(method: string): boolean {
  const protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  return protectedMethods.includes(method.toUpperCase());
}

/**
 * Middleware helper to validate CSRF for protected requests
 *
 * @param request - Next.js request object
 * @returns True if request is valid, false otherwise
 */
export async function validateCsrfRequest(request: NextRequest): Promise<boolean> {
  // Skip CSRF validation for safe methods
  if (!requiresCsrfProtection(request.method)) {
    return true;
  }

  // Validate origin first
  if (!validateOrigin(request)) {
    return false;
  }

  // Validate CSRF token
  return await validateCsrfToken(request);
}

/**
 * Get CSRF token for client-side use
 *
 * This should be called from a server component or API route
 * to provide the token to the client.
 *
 * @returns CSRF token
 */
export async function getOrCreateCsrfToken(): Promise<string> {
  let token = await getCsrfToken();

  if (!token) {
    token = await generateCsrfToken();
  }

  return token;
}

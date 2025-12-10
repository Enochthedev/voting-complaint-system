import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateCsrfRequest } from '@/lib/csrf';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Next.js Middleware for Route Protection and Role-Based Access Control
 *
 * This middleware runs before every request and handles:
 * - Session refresh (critical for maintaining auth state)
 * - CSRF protection for state-changing requests
 * - Authentication verification
 * - Role-based authorization
 * - Automatic redirects for unauthenticated users
 * - Cookie management for SSR
 */

// Define protected routes and their required roles
const PROTECTED_ROUTES = {
  '/dashboard': ['student', 'lecturer', 'admin'],
  '/complaints': ['student', 'lecturer', 'admin'],
  '/admin': ['admin'],
  '/settings': ['student', 'lecturer', 'admin'],
  '/notifications': ['student', 'lecturer', 'admin'],
  '/votes': ['student', 'lecturer', 'admin'],
  '/announcements': ['student', 'lecturer', 'admin'],
  '/analytics': ['lecturer', 'admin'],
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
  '/',
];

/**
 * Check if a route requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  return Object.keys(PROTECTED_ROUTES).some((route) => pathname.startsWith(route));
}

/**
 * Get required roles for a route
 */
function getRequiredRoles(pathname: string): string[] | null {
  const matchingRoute = Object.keys(PROTECTED_ROUTES).find((route) => pathname.startsWith(route));
  return matchingRoute ? PROTECTED_ROUTES[matchingRoute as keyof typeof PROTECTED_ROUTES] : null;
}

/**
 * Check if user has access to route based on role
 */
function hasAccess(userRole: string | null, requiredRoles: string[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Skip CSRF validation for CSRF token endpoint and auth callback
  const skipCsrfPaths = ['/api/csrf-token', '/auth/callback', '/callback'];
  const shouldSkipCsrf = skipCsrfPaths.some((path) => pathname.startsWith(path));

  // Validate CSRF for state-changing requests (POST, PUT, PATCH, DELETE)
  if (!shouldSkipCsrf && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const isValidCsrf = await validateCsrfRequest(request);

    if (!isValidCsrf) {
      console.warn(`CSRF validation failed for ${request.method} ${pathname}`);
      return NextResponse.json(
        {
          error: 'CSRF validation failed',
          message: 'Invalid or missing CSRF token',
        },
        { status: 403 }
      );
    }
  }

  // Update session - this is critical for maintaining auth state
  // It refreshes the session if expired and updates cookies
  const { supabaseResponse, supabase, user } = await updateSession(request);

  // Use the response from updateSession to preserve cookie updates
  let response = supabaseResponse;

  // Get session for additional checks
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  // If there's an error getting session, redirect to login for protected routes
  if (sessionError) {
    console.error('Session error:', sessionError);
    if (isProtectedRoute(pathname)) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  // If route is protected and user is not authenticated
  if (isProtectedRoute(pathname) && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    console.log(`Redirecting unauthenticated user from ${pathname} to login`);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and trying to access public auth pages
  if (user && (pathname === '/login' || pathname === '/register')) {
    console.log(`Redirecting authenticated user from ${pathname} to dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Check role-based access for protected routes
  if (isProtectedRoute(pathname) && user) {
    const requiredRoles = getRequiredRoles(pathname);

    if (requiredRoles) {
      // Get user role from the public.users table via RPC or direct query
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        console.error('Error fetching user role:', userError);
        // Redirect to login if we can't verify role
        return NextResponse.redirect(new URL('/login?error=role_verification_failed', request.url));
      }

      const userRole = userData.role;

      // Check if user has required role
      if (!hasAccess(userRole, requiredRoles)) {
        console.log(`Access denied: User role ${userRole} doesn't have access to ${pathname}`);
        // Redirect to dashboard with error
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

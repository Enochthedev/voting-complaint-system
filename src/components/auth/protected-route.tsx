'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '@/lib/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}

/**
 * Protected Route Wrapper Component
 *
 * Wraps components that require authentication and optionally role-based access.
 * Shows a loading state while checking authentication, redirects if unauthorized.
 *
 * @param children - Components to render if authorized
 * @param allowedRoles - Optional array of roles that can access this route
 * @param redirectTo - Optional custom redirect path (defaults to /login)
 * @param loadingComponent - Optional custom loading component
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
  loadingComponent,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthorized, setIsAuthorized] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const user = await getCurrentUser();

        if (!isMounted) return;

        // User is not authenticated
        if (!user) {
          const currentPath = window.location.pathname;
          const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
          router.push(redirectUrl);
          return;
        }

        // Check role-based access if roles are specified
        if (allowedRoles && allowedRoles.length > 0) {
          const userRole = user.user_metadata?.role as UserRole | undefined;

          if (!userRole || !allowedRoles.includes(userRole)) {
            setError('You do not have permission to access this page.');
            setIsAuthorized(false);
            setIsLoading(false);

            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
            return;
          }
        }

        // User is authenticated and authorized
        setIsAuthorized(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Error checking authentication:', err);

        if (!isMounted) return;

        setError('An error occurred while verifying your access.');
        setIsLoading(false);

        // Redirect to login on error
        setTimeout(() => {
          router.push(redirectTo);
        }, 2000);
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router, allowedRoles, redirectTo]);

  // Show loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-50">Access Denied</h2>
          <p className="mt-2 text-sm text-red-700 dark:text-red-200">{error}</p>
          <p className="mt-4 text-xs text-red-600 dark:text-red-300">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Render children if authorized
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Fallback (should not reach here)
  return null;
}

/**
 * Hook to use protected route functionality
 *
 * @param allowedRoles - Optional array of roles that can access
 * @returns Object with loading state, user, and authorization status
 */
export function useProtectedRoute(allowedRoles?: UserRole[]) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [user, setUser] = React.useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const currentUser = await getCurrentUser();

        if (!isMounted) return;

        if (!currentUser) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        setUser(currentUser);

        // Check role-based access if roles are specified
        if (allowedRoles && allowedRoles.length > 0) {
          const userRole = currentUser.user_metadata?.role as UserRole | undefined;

          if (!userRole || !allowedRoles.includes(userRole)) {
            setError('You do not have permission to access this resource.');
            setIsAuthorized(false);
            setIsLoading(false);
            return;
          }
        }

        setIsAuthorized(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Error checking authentication:', err);

        if (!isMounted) return;

        setError('An error occurred while verifying your access.');
        setIsLoading(false);
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [allowedRoles]);

  return {
    isLoading,
    user,
    isAuthorized,
    error,
  };
}

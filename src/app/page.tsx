'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!hasRedirected && !isLoading) {
        console.log('Redirect timeout - forcing redirect to login');
        router.push('/login');
        setHasRedirected(true);
      }
    }, 3000); // 3 second timeout

    if (!isLoading && !hasRedirected) {
      // If user is logged in, redirect to dashboard
      if (user) {
        console.log('User found, redirecting to dashboard');
        router.push('/dashboard');
        setHasRedirected(true);
      } else {
        // If not logged in, redirect to login
        console.log('No user, redirecting to login');
        router.push('/login');
        setHasRedirected(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [user, isLoading, router, hasRedirected]);

  // Show loading state while checking auth
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

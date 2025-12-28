import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'lecturer' | 'admin';
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Track latest loadUser request to prevent race conditions
  const loadUserRequestId = useRef(0);

  // Define loadUser before useEffect so it can be called
  const loadUser = useCallback(async () => {
    // FIX: Prevent race conditions by tracking request IDs
    // Increment request ID and capture it for this specific request
    const currentRequestId = ++loadUserRequestId.current;

    try {
      setIsLoading(true);
      setError(null);

      const authUser = await getCurrentUser();

      // Only update state if this is still the latest request
      if (currentRequestId !== loadUserRequestId.current) {
        console.log('Ignoring stale loadUser request');
        return;
      }

      if (!authUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Check current session
      // Using singleton supabase client
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Check again if this is still the latest request
      if (currentRequestId !== loadUserRequestId.current) {
        console.log('Ignoring stale loadUser request after auth check');
        return;
      }

      // Fetch user details from database to get role
      const {
        data: userData,
        error: dbError,
        count,
      } = await supabase
        .from('users')
        .select('id, email, full_name, role', { count: 'exact' })
        .eq('id', authUser.id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors if not found

      // Final check if this is still the latest request
      if (currentRequestId !== loadUserRequestId.current) {
        console.log('Ignoring stale loadUser request after DB fetch');
        return;
      }

      if (dbError) {
        console.error('❌ Error fetching user data:', dbError);

        // Clear user state on database error to prevent stale data
        setError('Failed to load user data');
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (!userData) {
        console.error('❌ User not found in database:', authUser.id);

        // Clear user state if not found in database
        setError('User profile not found');
        setUser(null);
        setIsLoading(false);
        return;
      }

      setUser(userData as AuthUser);
    } catch (err) {
      console.error('Error loading user:', err);

      // Only update state if this is still the latest request
      if (currentRequestId === loadUserRequestId.current) {
        // Clear user state on error to prevent displaying stale data
        setError('Failed to load user');
        setUser(null);
      }
    } finally {
      // Only update loading state if this is still the latest request
      if (currentRequestId === loadUserRequestId.current) {
        setIsLoading(false);
      }
    }
  }, []); // Empty dependencies - function is stable

  useEffect(() => {
    loadUser();

    // Subscribe to auth changes
    // Using singleton supabase client
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (event === 'SIGNED_IN' && session) {
        await loadUser();
        // Invalidate all queries when user signs in to fetch fresh data
        queryClient.invalidateQueries();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        // Clear all cached queries when user signs out
        queryClient.clear();
        // Only redirect if not already on login/register/reset-password pages
        if (typeof window !== 'undefined') {
          const pathname = window.location.pathname;
          if (!pathname.startsWith('/login') && !pathname.startsWith('/register') && !pathname.startsWith('/reset-password')) {
            router.push('/login');
          }
        }
      } else if (event === 'TOKEN_REFRESHED') {
        // FIX: Check current session instead of relying on stale closure
        // Only reload user if we don't have an active session with user data
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (currentSession && currentSession.user) {
          // Check if we have user data loaded
          // This prevents unnecessary reloads when user is already loaded
          const hasUserData = user !== null;
          if (!hasUserData) {
            await loadUser();
          }
        }
      } else if (event === 'USER_UPDATED') {
        await loadUser();
        // Invalidate queries when user data is updated
        queryClient.invalidateQueries();
      }
    });

    // Note: Removed the 5-minute refresh interval
    // Session refresh is already handled by:
    // 1. Supabase client auto-refresh
    // 2. Middleware on every request
    // 3. onAuthStateChange TOKEN_REFRESHED event
    // Having multiple refresh mechanisms can cause conflicts and unnecessary requests

    return () => {
      subscription.unsubscribe();
    };
    // FIX: Added queryClient and loadUser to dependencies
    // loadUser is wrapped in useCallback with no dependencies, so it's stable
    // 'user' is intentionally not a dependency to avoid infinite loops in auth state change handler
  }, [router, queryClient, loadUser]);

  const signOut = async () => {
    try {
      // Clear user state and cache immediately (optimistic)
      setUser(null);
      queryClient.clear();

      // Using singleton supabase client
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        // Don't throw - still redirect even if server signout fails
        // The session is already cleared client-side
      }

      // Redirect to login (don't rely on auth state change listener)
      // The listener also redirects, but this ensures immediate redirect
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Sign out failed:', err);
      // Don't throw - always clear session and redirect
      setUser(null);
      queryClient.clear();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  return { user, isLoading, error, refetch: loadUser, signOut };
}

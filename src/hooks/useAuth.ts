import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

  useEffect(() => {
    loadUser();

    // Subscribe to auth changes
    // Using singleton supabase client
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log('Auth state changed:', event);

      if (event === 'SIGNED_IN' && session) {
        await loadUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        router.push('/login');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
        await loadUser();
      } else if (event === 'USER_UPDATED') {
        await loadUser();
      }
    });

    // Set up automatic session refresh check every 5 minutes
    const refreshInterval = setInterval(
      async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Check if session is about to expire (within 10 minutes)
          const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
          const now = Date.now();
          const timeUntilExpiry = expiresAt - now;

          // If session expires in less than 10 minutes, refresh it
          if (timeUntilExpiry < 10 * 60 * 1000) {
            console.log('Session expiring soon, refreshing...');
            const { error } = await supabase.auth.refreshSession();
            if (error) {
              console.error('Failed to refresh session:', error);
              // Session expired, redirect to login
              setUser(null);
              router.push('/login');
            }
          }
        } else {
          // No session, redirect to login
          console.log('No session found, redirecting to login');
          setUser(null);
          router.push('/login');
        }
      },
      5 * 60 * 1000
    ); // Check every 5 minutes

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [router]);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const authUser = await getCurrentUser();

      if (!authUser) {
        console.log('No auth user found');
        setUser(null);
        setIsLoading(false);
        return;
      }

      console.log('Auth user found:', authUser.id, authUser.email);

      // Check current session
      // Using singleton supabase client
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log('Current session:', session ? 'exists' : 'null');
      console.log('Session user:', session?.user?.id);

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

      console.log('Query result - data:', userData, 'error:', dbError, 'count:', count);

      if (dbError) {
        console.error('Error fetching user data:', dbError);
        console.error('Error details:', JSON.stringify(dbError, null, 2));
        console.error('Error code:', dbError.code);
        console.error('Error message:', dbError.message);

        // Don't clear user if we already have one - just log the error
        if (!user) {
          setError('Failed to load user data');
          setUser(null);
        }
        setIsLoading(false);
        return;
      }

      if (!userData) {
        console.error('User not found in database:', authUser.id);
        console.error('This might be an RLS policy issue');

        // Don't clear user if we already have one
        if (!user) {
          setError('User profile not found');
          setUser(null);
        }
        setIsLoading(false);
        return;
      }

      console.log('User data loaded:', userData);
      setUser(userData as AuthUser);
    } catch (err) {
      console.error('Error loading user:', err);

      // Don't clear user if we already have one - prevents blank page
      if (!user) {
        setError('Failed to load user');
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Using singleton supabase client
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      setUser(null);
    } catch (err) {
      console.error('Sign out failed:', err);
      throw err;
    }
  };

  return { user, isLoading, error, refetch: loadUser, signOut };
}

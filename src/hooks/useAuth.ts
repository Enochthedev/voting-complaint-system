import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getSupabaseClient } from '@/lib/auth';
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
    const supabase = getSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (event === 'SIGNED_IN' && session) {
        await loadUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
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
      const supabase = getSupabaseClient();
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
        setError('Failed to load user data');
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (!userData) {
        console.error('User not found in database:', authUser.id);
        console.error('This might be an RLS policy issue');
        setError('User profile not found');
        setUser(null);
        setIsLoading(false);
        return;
      }

      console.log('User data loaded:', userData);
      setUser(userData as AuthUser);
    } catch (err) {
      console.error('Error loading user:', err);
      setError('Failed to load user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const supabase = getSupabaseClient();
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

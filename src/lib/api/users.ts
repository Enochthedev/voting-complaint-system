import { supabase } from '@/lib/supabase';
import { withRateLimit } from '@/lib/rate-limiter';
import type { User } from '@/types/database.types';

/**
 * Get all users (admin only)
 */
async function getAllUsersImpl(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    throw new Error(error.message || 'Failed to fetch users');
  }

  return data || [];
}

export const getAllUsers = withRateLimit(getAllUsersImpl, 'read');

/**
 * Get a single user by ID
 */
async function getUserByIdImpl(userId: string): Promise<User | null> {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();

  if (error) {
    console.error('Error fetching user:', error);
    throw new Error(error.message || 'Failed to fetch user');
  }

  return data;
}

export const getUserById = withRateLimit(getUserByIdImpl, 'read');

/**
 * Update user role (admin only)
 */
async function updateUserRoleImpl(
  userId: string,
  newRole: 'student' | 'lecturer' | 'admin'
): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user role:', error);
    throw new Error(error.message || 'Failed to update user role');
  }

  return data;
}

export const updateUserRole = withRateLimit(updateUserRoleImpl, 'write');

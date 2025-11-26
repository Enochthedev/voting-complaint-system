/**
 * Server-Side Authentication Helper Functions
 *
 * This module provides authentication utilities for Server Components,
 * API routes, and server actions. These functions use the server-side
 * Supabase client with cookie-based session management.
 */

import { createServerClient } from './supabase-server';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from './constants';

/**
 * Get the current authenticated user (server-side)
 *
 * @returns Current user or null if not authenticated
 */
export async function getCurrentUserServer(): Promise<User | null> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Error fetching user (server):', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Unexpected error fetching user (server):', error);
    return null;
  }
}

/**
 * Get the current user's session (server-side)
 *
 * @returns Current session or null if not authenticated
 */
export async function getSessionServer() {
  try {
    const supabase = await createServerClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Error fetching session (server):', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Unexpected error fetching session (server):', error);
    return null;
  }
}

/**
 * Get the current user's role from database (server-side)
 *
 * This fetches the role from the public.users table, which is the
 * single source of truth for user roles. Never trust client-side metadata.
 *
 * @returns User's role or null if not authenticated
 */
export async function getUserRoleServer(): Promise<UserRole | null> {
  const user = await getCurrentUserServer();

  if (!user) {
    return null;
  }

  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.from('users').select('role').eq('id', user.id).single();

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    return (data?.role as UserRole) || null;
  } catch (error) {
    console.error('Unexpected error fetching user role:', error);
    return null;
  }
}

/**
 * Check if the current user has a specific role (server-side)
 *
 * @param role - Role to check
 * @returns True if user has the role, false otherwise
 */
export async function hasRoleServer(role: UserRole): Promise<boolean> {
  const userRole = await getUserRoleServer();
  return userRole === role;
}

/**
 * Check if the current user is a student (server-side)
 *
 * @returns True if user is a student, false otherwise
 */
export async function isStudentServer(): Promise<boolean> {
  return hasRoleServer('student');
}

/**
 * Check if the current user is a lecturer (server-side)
 *
 * @returns True if user is a lecturer, false otherwise
 */
export async function isLecturerServer(): Promise<boolean> {
  return hasRoleServer('lecturer');
}

/**
 * Check if the current user is an admin (server-side)
 *
 * @returns True if user is an admin, false otherwise
 */
export async function isAdminServer(): Promise<boolean> {
  return hasRoleServer('admin');
}

/**
 * Check if the current user is a lecturer or admin (server-side)
 *
 * @returns True if user is a lecturer or admin, false otherwise
 */
export async function isLecturerOrAdminServer(): Promise<boolean> {
  const userRole = await getUserRoleServer();
  return userRole === 'lecturer' || userRole === 'admin';
}

/**
 * Check if user is authenticated (server-side)
 *
 * @returns True if user is authenticated, false otherwise
 */
export async function isAuthenticatedServer(): Promise<boolean> {
  const user = await getCurrentUserServer();
  return user !== null;
}

/**
 * Get user's full name from metadata (server-side)
 *
 * @returns User's full name or null if not available
 */
export async function getUserFullNameServer(): Promise<string | null> {
  const user = await getCurrentUserServer();

  if (!user || !user.user_metadata) {
    return null;
  }

  return (user.user_metadata.full_name as string) || null;
}

/**
 * Get user's email (server-side)
 *
 * @returns User's email or null if not authenticated
 */
export async function getUserEmailServer(): Promise<string | null> {
  const user = await getCurrentUserServer();
  return user?.email || null;
}

/**
 * Require authentication (server-side)
 * Throws an error if user is not authenticated
 *
 * @returns Authenticated user
 * @throws Error if user is not authenticated
 */
export async function requireAuthServer(): Promise<User> {
  const user = await getCurrentUserServer();

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

/**
 * Require specific role (server-side)
 * Throws an error if user doesn't have the required role
 *
 * @param role - Required role
 * @returns Authenticated user with required role
 * @throws Error if user doesn't have required role
 */
export async function requireRoleServer(role: UserRole): Promise<User> {
  const user = await requireAuthServer();
  const userRole = await getUserRoleServer();

  if (userRole !== role) {
    throw new Error(`Role '${role}' required`);
  }

  return user;
}

/**
 * Require lecturer or admin role (server-side)
 * Throws an error if user is not a lecturer or admin
 *
 * @returns Authenticated user with lecturer or admin role
 * @throws Error if user is not a lecturer or admin
 */
export async function requireLecturerOrAdminServer(): Promise<User> {
  const user = await requireAuthServer();
  const userRole = await getUserRoleServer();

  if (userRole !== 'lecturer' && userRole !== 'admin') {
    throw new Error('Lecturer or admin role required');
  }

  return user;
}

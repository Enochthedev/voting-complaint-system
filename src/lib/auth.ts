/**
 * Authentication Helper Functions
 * 
 * This module provides comprehensive authentication utilities for the
 * Student Complaint Resolution System, including sign up, sign in,
 * sign out, password reset, and role-based access control.
 */

import { supabase } from './supabase';
import type { User, AuthError } from '@supabase/supabase-js';
import type { UserRole } from './constants';

/**
 * Authentication response type
 */
export interface AuthResponse {
  user: User | null;
  error: AuthError | null;
}

/**
 * Sign up a new user with email and password
 * 
 * @param email - User's email address
 * @param password - User's password
 * @param fullName - User's full name
 * @param role - User's role (student, lecturer, admin)
 * @returns Authentication response with user or error
 */
export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: UserRole
): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      console.error('Sign up error:', error);
      return { user: null, error };
    }

    return { user: data.user, error: null };
  } catch (error) {
    console.error('Unexpected sign up error:', error);
    return {
      user: null,
      error: error as AuthError,
    };
  }
}

/**
 * Sign in an existing user with email and password
 * 
 * @param email - User's email address
 * @param password - User's password
 * @returns Authentication response with user or error
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      return { user: null, error };
    }

    return { user: data.user, error: null };
  } catch (error) {
    console.error('Unexpected sign in error:', error);
    return {
      user: null,
      error: error as AuthError,
    };
  }
}

/**
 * Sign out the current user
 * 
 * @returns Error if sign out fails, null otherwise
 */
export async function signOut(): Promise<AuthError | null> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      return error;
    }

    return null;
  } catch (error) {
    console.error('Unexpected sign out error:', error);
    return error as AuthError;
  }
}

/**
 * Get the current authenticated user
 * 
 * @returns Current user or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Unexpected error fetching user:', error);
    return null;
  }
}

/**
 * Get the current user's session
 * 
 * @returns Current session or null if not authenticated
 */
export async function getSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Error fetching session:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Unexpected error fetching session:', error);
    return null;
  }
}

/**
 * Get the current user's role from metadata
 * 
 * @returns User's role or null if not authenticated
 */
export async function getUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser();

  if (!user || !user.user_metadata) {
    return null;
  }

  return (user.user_metadata.role as UserRole) || null;
}

/**
 * Check if the current user has a specific role
 * 
 * @param role - Role to check
 * @returns True if user has the role, false otherwise
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const userRole = await getUserRole();
  return userRole === role;
}

/**
 * Check if the current user is a student
 * 
 * @returns True if user is a student, false otherwise
 */
export async function isStudent(): Promise<boolean> {
  return hasRole('student');
}

/**
 * Check if the current user is a lecturer
 * 
 * @returns True if user is a lecturer, false otherwise
 */
export async function isLecturer(): Promise<boolean> {
  return hasRole('lecturer');
}

/**
 * Check if the current user is an admin
 * 
 * @returns True if user is an admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('admin');
}

/**
 * Check if the current user is a lecturer or admin
 * 
 * @returns True if user is a lecturer or admin, false otherwise
 */
export async function isLecturerOrAdmin(): Promise<boolean> {
  const userRole = await getUserRole();
  return userRole === 'lecturer' || userRole === 'admin';
}

/**
 * Send password reset email
 * 
 * @param email - User's email address
 * @returns Error if request fails, null otherwise
 */
export async function resetPassword(email: string): Promise<AuthError | null> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) {
      console.error('Password reset error:', error);
      return error;
    }

    return null;
  } catch (error) {
    console.error('Unexpected password reset error:', error);
    return error as AuthError;
  }
}

/**
 * Update user password
 * 
 * @param newPassword - New password
 * @returns Error if update fails, null otherwise
 */
export async function updatePassword(
  newPassword: string
): Promise<AuthError | null> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('Password update error:', error);
      return error;
    }

    return null;
  } catch (error) {
    console.error('Unexpected password update error:', error);
    return error as AuthError;
  }
}

/**
 * Update user metadata
 * 
 * @param metadata - Metadata to update
 * @returns Error if update fails, null otherwise
 */
export async function updateUserMetadata(
  metadata: Record<string, any>
): Promise<AuthError | null> {
  try {
    const { error } = await supabase.auth.updateUser({
      data: metadata,
    });

    if (error) {
      console.error('Metadata update error:', error);
      return error;
    }

    return null;
  } catch (error) {
    console.error('Unexpected metadata update error:', error);
    return error as AuthError;
  }
}

/**
 * Subscribe to authentication state changes
 * 
 * @param callback - Callback function to execute on auth state change
 * @returns Unsubscribe function
 */
export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Check if user is authenticated
 * 
 * @returns True if user is authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Validate email format
 * 
 * @param email - Email to validate
 * @returns True if email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * 
 * @param password - Password to validate
 * @returns Object with validation result and message
 */
export function validatePassword(password: string): {
  isValid: boolean;
  message: string;
} {
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    };
  }

  return {
    isValid: true,
    message: 'Password is valid',
  };
}

/**
 * Get user's full name from metadata
 * 
 * @returns User's full name or null if not available
 */
export async function getUserFullName(): Promise<string | null> {
  const user = await getCurrentUser();

  if (!user || !user.user_metadata) {
    return null;
  }

  return (user.user_metadata.full_name as string) || null;
}

/**
 * Get user's email
 * 
 * @returns User's email or null if not authenticated
 */
export async function getUserEmail(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.email || null;
}

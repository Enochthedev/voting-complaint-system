/**
 * Mock Authentication for UI Development
 * 
 * This module provides mock authentication for UI development (Phase 3-11).
 * It simulates authentication without connecting to Supabase.
 * 
 * TODO: Remove this file in Phase 12 and use real auth
 */

import type { UserRole } from './constants';

export interface MockUser {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
}

// Mock users for testing different roles
export const MOCK_USERS: Record<string, MockUser> = {
  'student@test.com': {
    id: 'mock-student-id',
    email: 'student@test.com',
    role: 'student',
    full_name: 'Test Student',
  },
  'lecturer@test.com': {
    id: 'mock-lecturer-id',
    email: 'lecturer@test.com',
    role: 'lecturer',
    full_name: 'Test Lecturer',
  },
  'admin@test.com': {
    id: 'mock-admin-id',
    email: 'admin@test.com',
    role: 'admin',
    full_name: 'Test Admin',
  },
};

// Mock password (same for all users for simplicity)
const MOCK_PASSWORD = 'password123';

// Store current user in localStorage
const STORAGE_KEY = 'mock_auth_user';

/**
 * Mock sign in - accepts any email from MOCK_USERS with password "password123"
 */
export function mockSignIn(email: string, password: string): {
  success: boolean;
  user?: MockUser;
  error?: string;
} {
  console.log('🎭 Mock Auth: Attempting sign in for:', email);

  // Check if user exists
  const user = MOCK_USERS[email.toLowerCase()];
  
  if (!user) {
    console.log('🎭 Mock Auth: User not found');
    return {
      success: false,
      error: 'Invalid email or password',
    };
  }

  // Check password
  if (password !== MOCK_PASSWORD) {
    console.log('🎭 Mock Auth: Invalid password');
    return {
      success: false,
      error: 'Invalid email or password',
    };
  }

  // Store user in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  console.log('🎭 Mock Auth: Sign in successful for:', user.full_name);
  return {
    success: true,
    user,
  };
}

/**
 * Mock sign out
 */
export function mockSignOut(): void {
  console.log('🎭 Mock Auth: Signing out');
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Get current mock user
 */
export function getMockUser(): MockUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as MockUser;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isMockAuthenticated(): boolean {
  return getMockUser() !== null;
}

/**
 * Get mock user role
 */
export function getMockUserRole(): UserRole | null {
  const user = getMockUser();
  return user?.role || null;
}

/**
 * Authentication Type Definitions
 *
 * This file contains all type definitions related to authentication,
 * user management, and authorization.
 */

import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { UserRole } from '@/lib/constants';

/**
 * Extended user profile from public.users table
 */
export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * User metadata stored in auth.users
 */
export interface UserMetadata {
  full_name: string;
  role: UserRole;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: User | null;
  error: AuthError | null;
}

/**
 * Session response
 */
export interface SessionResponse {
  session: Session | null;
  error: AuthError | null;
}

/**
 * Sign up credentials
 */
export interface SignUpCredentials {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

/**
 * Sign in credentials
 */
export interface SignInCredentials {
  email: string;
  password: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password update request
 */
export interface PasswordUpdateRequest {
  newPassword: string;
}

/**
 * User with profile data
 */
export interface UserWithProfile extends User {
  profile?: UserProfile;
}

/**
 * Authentication state
 */
export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}

/**
 * Authentication context
 */
export interface AuthContext {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
  signUp: (credentials: SignUpCredentials) => Promise<AuthResponse>;
  signIn: (credentials: SignInCredentials) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

/**
 * Role-based permissions
 */
export interface RolePermissions {
  canViewAllComplaints: boolean;
  canManageComplaints: boolean;
  canCreateVotes: boolean;
  canCreateAnnouncements: boolean;
  canViewAnalytics: boolean;
  canManageEscalationRules: boolean;
  canPerformBulkActions: boolean;
  canManageTemplates: boolean;
}

/**
 * Get permissions for a role
 */
export function getRolePermissions(role: UserRole | null): RolePermissions {
  if (!role) {
    return {
      canViewAllComplaints: false,
      canManageComplaints: false,
      canCreateVotes: false,
      canCreateAnnouncements: false,
      canViewAnalytics: false,
      canManageEscalationRules: false,
      canPerformBulkActions: false,
      canManageTemplates: false,
    };
  }

  switch (role) {
    case 'student':
      return {
        canViewAllComplaints: false,
        canManageComplaints: false,
        canCreateVotes: false,
        canCreateAnnouncements: false,
        canViewAnalytics: false,
        canManageEscalationRules: false,
        canPerformBulkActions: false,
        canManageTemplates: false,
      };

    case 'lecturer':
      return {
        canViewAllComplaints: true,
        canManageComplaints: true,
        canCreateVotes: true,
        canCreateAnnouncements: true,
        canViewAnalytics: true,
        canManageEscalationRules: false,
        canPerformBulkActions: true,
        canManageTemplates: true,
      };

    case 'admin':
      return {
        canViewAllComplaints: true,
        canManageComplaints: true,
        canCreateVotes: true,
        canCreateAnnouncements: true,
        canViewAnalytics: true,
        canManageEscalationRules: true,
        canPerformBulkActions: true,
        canManageTemplates: true,
      };

    default:
      return {
        canViewAllComplaints: false,
        canManageComplaints: false,
        canCreateVotes: false,
        canCreateAnnouncements: false,
        canViewAnalytics: false,
        canManageEscalationRules: false,
        canPerformBulkActions: false,
        canManageTemplates: false,
      };
  }
}

/**
 * Check if user has permission
 */
export function hasPermission(role: UserRole | null, permission: keyof RolePermissions): boolean {
  const permissions = getRolePermissions(role);
  return permissions[permission];
}

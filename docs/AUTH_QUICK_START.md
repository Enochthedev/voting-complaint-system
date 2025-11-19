# Authentication Quick Start Guide

This guide provides a quick reference for implementing authentication in the Student Complaint Resolution System.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Client-Side Authentication](#client-side-authentication)
3. [Server-Side Authentication](#server-side-authentication)
4. [Role-Based Access Control](#role-based-access-control)
5. [Common Patterns](#common-patterns)

## Basic Usage

### Sign Up a New User

```typescript
import { signUp } from '@/lib/auth';

const { user, error } = await signUp(
  'student@example.com',
  'SecurePassword123',
  'John Doe',
  'student'
);

if (error) {
  console.error('Sign up failed:', error.message);
} else {
  console.log('User created:', user);
}
```

### Sign In

```typescript
import { signIn } from '@/lib/auth';

const { user, error } = await signIn(
  'student@example.com',
  'SecurePassword123'
);

if (error) {
  console.error('Sign in failed:', error.message);
} else {
  console.log('Signed in:', user);
}
```

### Sign Out

```typescript
import { signOut } from '@/lib/auth';

const error = await signOut();

if (error) {
  console.error('Sign out failed:', error.message);
} else {
  console.log('Signed out successfully');
}
```

### Get Current User

```typescript
import { getCurrentUser } from '@/lib/auth';

const user = await getCurrentUser();

if (user) {
  console.log('Current user:', user.email);
} else {
  console.log('Not authenticated');
}
```

## Client-Side Authentication

Use these functions in Client Components (with 'use client' directive):

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, getUserRole, onAuthStateChange } from '@/lib/auth';

export default function ProfileComponent() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    // Get initial user
    getCurrentUser().then(setUser);
    getUserRole().then(setRole);

    // Subscribe to auth changes
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      if (user) {
        getUserRole().then(setRole);
      } else {
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <p>Email: {user.email}</p>
      <p>Role: {role}</p>
    </div>
  );
}
```

## Server-Side Authentication

Use these functions in Server Components, API routes, and Server Actions:

```typescript
import { getCurrentUserServer, getUserRoleServer } from '@/lib/auth-server';

export default async function ServerComponent() {
  const user = await getCurrentUserServer();
  const role = await getUserRoleServer();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <p>Email: {user.email}</p>
      <p>Role: {role}</p>
    </div>
  );
}
```

### Require Authentication

```typescript
import { requireAuthServer } from '@/lib/auth-server';

export default async function ProtectedPage() {
  try {
    const user = await requireAuthServer();
    
    return <div>Welcome, {user.email}</div>;
  } catch (error) {
    // Redirect to login or show error
    return <div>Please log in</div>;
  }
}
```

### Require Specific Role

```typescript
import { requireRoleServer } from '@/lib/auth-server';

export default async function LecturerOnlyPage() {
  try {
    const user = await requireRoleServer('lecturer');
    
    return <div>Lecturer Dashboard</div>;
  } catch (error) {
    return <div>Access denied</div>;
  }
}
```

## Role-Based Access Control

### Check User Role

```typescript
import { hasRole, isStudent, isLecturer, isAdmin } from '@/lib/auth';

// Check specific role
const isStudentUser = await isStudent();

// Check lecturer or admin
const canManage = await isLecturerOrAdmin();

// Check any role
const hasLecturerRole = await hasRole('lecturer');
```

### Use Permissions

```typescript
import { getUserRole } from '@/lib/auth';
import { getRolePermissions } from '@/types/auth.types';

const role = await getUserRole();
const permissions = getRolePermissions(role);

if (permissions.canViewAllComplaints) {
  // Show all complaints
}

if (permissions.canManageComplaints) {
  // Show management options
}
```

## Common Patterns

### Protected Route Component

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isAuthenticated().then((authenticated) => {
      if (!authenticated) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
```

### Role-Based Component

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getUserRole } from '@/lib/auth';
import type { UserRole } from '@/lib/constants';

interface RoleBasedProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleBased({ allowedRoles, children, fallback }: RoleBasedProps) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserRole().then((role) => {
      setHasAccess(role !== null && allowedRoles.includes(role));
      setLoading(false);
    });
  }, [allowedRoles]);

  if (loading) {
    return null;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Usage
<RoleBased allowedRoles={['lecturer', 'admin']}>
  <LecturerDashboard />
</RoleBased>
```

### Password Reset Flow

```typescript
import { resetPassword } from '@/lib/auth';

// Request password reset
const error = await resetPassword('user@example.com');

if (error) {
  console.error('Password reset failed:', error.message);
} else {
  console.log('Password reset email sent');
}

// Update password (after clicking reset link)
import { updatePassword } from '@/lib/auth';

const error = await updatePassword('NewSecurePassword123');

if (error) {
  console.error('Password update failed:', error.message);
} else {
  console.log('Password updated successfully');
}
```

### Form Validation

```typescript
import { isValidEmail, validatePassword } from '@/lib/auth';

// Validate email
const emailValid = isValidEmail('user@example.com');

// Validate password
const { isValid, message } = validatePassword('MyPassword123');

if (!isValid) {
  console.error('Password validation failed:', message);
}
```

### API Route Protection

```typescript
// app/api/complaints/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserServer } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const user = await getCurrentUserServer();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Handle request
  return NextResponse.json({ data: 'Protected data' });
}
```

### Server Action Protection

```typescript
'use server';

import { requireAuthServer, requireRoleServer } from '@/lib/auth-server';

export async function createComplaint(formData: FormData) {
  // Require authentication
  const user = await requireAuthServer();

  // Or require specific role
  const lecturer = await requireRoleServer('lecturer');

  // Handle action
}
```

## Testing Authentication

### Test Sign Up

```typescript
import { signUp } from '@/lib/auth';

const testSignUp = async () => {
  const { user, error } = await signUp(
    'test@example.com',
    'TestPassword123',
    'Test User',
    'student'
  );

  console.assert(error === null, 'Sign up should succeed');
  console.assert(user !== null, 'User should be created');
  console.assert(user?.user_metadata.role === 'student', 'Role should be student');
};
```

### Test Role Checking

```typescript
import { hasRole, isStudent } from '@/lib/auth';

const testRoles = async () => {
  const isStudentUser = await isStudent();
  const hasStudentRole = await hasRole('student');

  console.assert(isStudentUser === hasStudentRole, 'Role checks should match');
};
```

## Troubleshooting

### User Not Persisting After Refresh

Make sure middleware is configured correctly and cookies are being set:

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  // Refresh session
  await supabase.auth.getUser();
  return response;
}
```

### Role Not Available

Ensure role is set during sign up:

```typescript
const { user, error } = await signUp(
  email,
  password,
  fullName,
  'student' // Make sure role is provided
);
```

### Session Expired

Sessions are automatically refreshed by Supabase client. If issues persist, check:

1. JWT expiry settings in Supabase dashboard
2. Auto-refresh is enabled in client configuration
3. Cookies are not being blocked

## Additional Resources

- [Full Authentication Configuration](./AUTH_CONFIGURATION.md)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Authentication](https://nextjs.org/docs/authentication)

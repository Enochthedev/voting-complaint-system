# Authentication Module

This directory contains the authentication and authorization logic for the Student Complaint Resolution System.

## Files

### `auth.ts`
Client-side authentication helpers for use in Client Components.

**Key Functions:**
- `signUp()` - Register new users
- `signIn()` - Authenticate users
- `signOut()` - Sign out current user
- `getCurrentUser()` - Get current user
- `getUserRole()` - Get user's role
- `hasRole()` - Check user role
- `isStudent()`, `isLecturer()`, `isAdmin()` - Role shortcuts
- `resetPassword()` - Send password reset email
- `updatePassword()` - Update user password
- `onAuthStateChange()` - Subscribe to auth changes

### `auth-server.ts`
Server-side authentication helpers for Server Components, API routes, and Server Actions.

**Key Functions:**
- All client functions with `Server` suffix
- `requireAuthServer()` - Require authentication (throws if not authenticated)
- `requireRoleServer()` - Require specific role (throws if not authorized)
- `requireLecturerOrAdminServer()` - Require elevated permissions

### `supabase.ts`
Supabase client configuration with auth settings.

**Configuration:**
- Session persistence enabled
- Auto token refresh enabled
- PKCE flow for security
- Custom storage key

### `supabase-server.ts`
Server-side Supabase client with cookie-based session management.

### `supabase-utils.ts`
Legacy utility functions (deprecated - use `auth.ts` instead).

## Usage

### Client-Side (Client Components)

```typescript
'use client';

import { signUp, signIn, getCurrentUser } from '@/lib/auth';

// Sign up
const { user, error } = await signUp(
  'user@example.com',
  'Password123',
  'John Doe',
  'student'
);

// Sign in
const { user, error } = await signIn('user@example.com', 'Password123');

// Get current user
const user = await getCurrentUser();
```

### Server-Side (Server Components, API Routes)

```typescript
import { getCurrentUserServer, requireAuthServer } from '@/lib/auth-server';

// Get current user
const user = await getCurrentUserServer();

// Require authentication
const user = await requireAuthServer(); // Throws if not authenticated

// Require specific role
const lecturer = await requireRoleServer('lecturer');
```

## User Roles

The system supports three roles:

1. **student** - Can submit and view own complaints
2. **lecturer** - Can manage complaints, create votes/announcements
3. **admin** - Full system access including escalation rules

Roles are stored in:
- `auth.users.user_metadata.role` (Supabase Auth)
- `public.users.role` (Application database)

## Role-Based Permissions

Use the permissions system for fine-grained access control:

```typescript
import { getUserRole } from '@/lib/auth';
import { getRolePermissions } from '@/types/auth.types';

const role = await getUserRole();
const permissions = getRolePermissions(role);

if (permissions.canManageComplaints) {
  // Show management UI
}
```

Available permissions:
- `canViewAllComplaints`
- `canManageComplaints`
- `canCreateVotes`
- `canCreateAnnouncements`
- `canViewAnalytics`
- `canManageEscalationRules`
- `canPerformBulkActions`
- `canManageTemplates`

## Security

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Session Management
- Sessions stored in HTTP-only cookies
- Auto-refresh enabled
- 1 hour session duration (configurable)
- 30 day refresh token duration

### Best Practices
1. Always use server-side functions for sensitive operations
2. Validate roles on both client and server
3. Use `requireAuthServer()` for protected routes
4. Never expose service role key to client
5. Enable email confirmation in production

## Testing

Run the test script to verify configuration:

```bash
node scripts/test-auth-functions.js
```

## Documentation

- **Configuration Guide**: `docs/AUTH_CONFIGURATION.md`
- **Quick Start Guide**: `docs/AUTH_QUICK_START.md`
- **Task Summary**: `docs/TASK_2.1_AUTH_SETUP_SUMMARY.md`

## Environment Variables

Required:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Next Steps

1. Implement authentication pages (Task 2.3)
2. Create protected route wrapper
3. Add role-based UI components
4. Test authentication flows
5. Implement RLS policies (Task 2.2)

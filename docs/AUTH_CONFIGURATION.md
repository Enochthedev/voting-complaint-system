# Supabase Authentication Configuration

This document outlines the authentication configuration for the Student Complaint Resolution System.

## Overview

The system uses Supabase Auth for user authentication and authorization. Users can sign up with email/password, and their role (student, lecturer, admin) is stored in user metadata.

## Authentication Settings

### Email/Password Authentication

The system uses email and password authentication with the following configuration:

- **Provider**: Email/Password (enabled by default in Supabase)
- **Email Confirmation**: Recommended to enable in production
- **Password Requirements**: 
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

### Supabase Dashboard Configuration

To configure authentication in your Supabase project:

1. **Navigate to Authentication Settings**
   - Go to your Supabase project dashboard
   - Click on "Authentication" in the left sidebar
   - Click on "Providers" tab

2. **Enable Email Provider**
   - Ensure "Email" provider is enabled
   - Configure email templates (optional)

3. **Configure Email Templates** (Optional but recommended)
   - Go to "Email Templates" tab
   - Customize the following templates:
     - Confirmation email
     - Password reset email
     - Magic link email (if using)

4. **Configure Site URL**
   - Go to "URL Configuration" tab
   - Set Site URL: `http://localhost:3000` (development) or your production URL
   - Add Redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/reset-password`
     - Add production URLs when deploying

5. **Configure JWT Settings** (Advanced)
   - Go to "Settings" > "API"
   - JWT expiry: Default is 3600 seconds (1 hour)
   - Refresh token expiry: Default is 2592000 seconds (30 days)

## User Metadata Schema

User metadata is stored in the `auth.users` table and includes:

```typescript
{
  full_name: string;  // User's full name
  role: 'student' | 'lecturer' | 'admin';  // User's role
}
```

## Role-Based Access Control

The system implements role-based access control (RBAC) with three roles:

### Student
- Can submit complaints
- Can view their own complaints
- Can participate in votes
- Can view announcements
- Cannot access lecturer/admin features

### Lecturer
- All student permissions
- Can view all complaints
- Can manage complaints (assign, update status, add feedback)
- Can create votes and announcements
- Can view analytics

### Admin
- All lecturer permissions
- Can manage escalation rules
- Can perform bulk operations
- Full system access

## Authentication Flow

### Sign Up Flow

1. User provides email, password, full name, and role
2. System validates input
3. Supabase creates user account with metadata
4. Email confirmation sent (if enabled)
5. User redirected to dashboard

### Sign In Flow

1. User provides email and password
2. Supabase validates credentials
3. Session created and stored in cookies
4. User redirected to role-appropriate dashboard

### Password Reset Flow

1. User requests password reset
2. System sends reset email via Supabase
3. User clicks link in email
4. User redirected to reset password page
5. User enters new password
6. Password updated in Supabase

## Session Management

- **Session Storage**: HTTP-only cookies (secure)
- **Session Duration**: 1 hour (configurable via JWT expiry)
- **Refresh Token**: 30 days (configurable)
- **Auto-refresh**: Enabled (handled by Supabase client)

## Security Considerations

1. **Password Security**
   - Passwords are hashed by Supabase (bcrypt)
   - Never store passwords in plain text
   - Enforce strong password requirements

2. **Session Security**
   - Use HTTP-only cookies
   - Enable HTTPS in production
   - Implement CSRF protection

3. **Role Security**
   - Roles stored in user metadata (not directly modifiable by users)
   - Row Level Security (RLS) policies enforce role-based access
   - Server-side validation of roles

4. **Email Verification**
   - Enable email confirmation in production
   - Prevent unverified users from accessing sensitive features

## Environment Variables

Required environment variables for authentication:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Session Configuration
SESSION_TIMEOUT=3600
```

## API Usage

### Client-Side Authentication

```typescript
import { signUp, signIn, signOut, getCurrentUser } from '@/lib/auth';

// Sign up
const { user, error } = await signUp(
  'user@example.com',
  'SecurePassword123',
  'John Doe',
  'student'
);

// Sign in
const { user, error } = await signIn('user@example.com', 'SecurePassword123');

// Sign out
await signOut();

// Get current user
const user = await getCurrentUser();
```

### Server-Side Authentication

```typescript
import { getCurrentUserServer, requireAuthServer } from '@/lib/auth-server';

// Get current user (server)
const user = await getCurrentUserServer();

// Require authentication
const user = await requireAuthServer(); // Throws if not authenticated

// Require specific role
const user = await requireRoleServer('lecturer'); // Throws if not lecturer
```

## Testing Authentication

### Manual Testing

1. **Test Sign Up**
   - Navigate to `/register`
   - Fill in form with valid data
   - Submit and verify account creation
   - Check email for confirmation (if enabled)

2. **Test Sign In**
   - Navigate to `/login`
   - Enter credentials
   - Verify successful login and redirect

3. **Test Role-Based Access**
   - Sign in as student
   - Verify student-only features accessible
   - Sign in as lecturer
   - Verify lecturer features accessible

4. **Test Password Reset**
   - Navigate to password reset page
   - Enter email
   - Check email for reset link
   - Follow link and reset password

### Automated Testing

```typescript
// Example test
describe('Authentication', () => {
  it('should sign up a new user', async () => {
    const { user, error } = await signUp(
      'test@example.com',
      'TestPassword123',
      'Test User',
      'student'
    );
    
    expect(error).toBeNull();
    expect(user).toBeDefined();
    expect(user?.user_metadata.role).toBe('student');
  });
});
```

## Troubleshooting

### Common Issues

1. **"Invalid login credentials"**
   - Verify email and password are correct
   - Check if email confirmation is required
   - Verify user exists in Supabase dashboard

2. **"User already registered"**
   - Email already exists in system
   - Use password reset if forgotten
   - Check Supabase dashboard for existing users

3. **Session not persisting**
   - Check cookie settings
   - Verify middleware is configured correctly
   - Check browser cookie settings

4. **Role not accessible**
   - Verify role is set in user metadata
   - Check RLS policies are configured
   - Verify JWT token includes role claim

## Production Checklist

Before deploying to production:

- [ ] Enable email confirmation
- [ ] Configure custom email templates
- [ ] Set production Site URL and Redirect URLs
- [ ] Enable HTTPS
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Test all authentication flows
- [ ] Review and test RLS policies
- [ ] Configure password policies
- [ ] Set up backup authentication method (optional)

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Authentication Guide](https://nextjs.org/docs/authentication)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

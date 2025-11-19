# Email/Password Authentication Setup Guide

## Overview

This guide provides step-by-step instructions for setting up and verifying email/password authentication in the Student Complaint Resolution System.

## Prerequisites

- Supabase project created and configured
- Environment variables set in `.env.local`
- Database migrations applied (001-017)

## Setup Steps

### 1. Configure Supabase Auth Settings

#### In Supabase Dashboard:

1. Navigate to **Authentication > Providers**
2. Ensure **Email** provider is enabled (it's enabled by default)
3. Configure email settings:
   - **Confirm email**: Disable for development (enable for production)
   - **Secure email change**: Enable for production
   - **Secure password change**: Enable for production

4. Navigate to **Authentication > URL Configuration**
5. Set the following URLs:
   - **Site URL**: `http://localhost:3000` (development) or your production URL
   - **Redirect URLs**: Add these URLs:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/reset-password`
     - Add production URLs when deploying

6. Navigate to **Authentication > Email Templates** (Optional)
   - Customize confirmation email template
   - Customize password reset email template
   - Add your branding and styling

### 2. Fix Users Table Trigger (If Needed)

If you encounter "Database error saving new user" when testing authentication, apply this fix:

#### Option A: Using Supabase Dashboard (Recommended)

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy and paste the following SQL:

```sql
-- Fix for users table trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add policy to allow user creation via trigger
DROP POLICY IF EXISTS "Allow user creation via trigger" ON public.users;
CREATE POLICY "Allow user creation via trigger"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
```

5. Click **Run** to execute the SQL
6. Verify no errors occurred

#### Option B: Using Script

Run the helper script to display the SQL:

```bash
node scripts/apply-auth-fix.js
```

Then copy the SQL and run it in Supabase SQL Editor.

### 3. Verify Configuration

Run the configuration verification script:

```bash
node scripts/configure-auth.js
```

Expected output:
- ✓ All environment variables set
- ✓ Supabase connection successful
- ✓ Users table exists and accessible
- ✓ Authentication configuration summary

### 4. Test Email/Password Authentication

Run the authentication test script:

```bash
node scripts/test-email-auth.js
```

Expected output:
- ✓ Sign up successful
- ✓ User metadata (role and full name) stored correctly
- ✓ Sign in successful
- ✓ Session management working
- ✓ Get current user working
- ✓ Sign out successful
- ✓ Invalid credentials rejected

## Authentication Features

### Implemented Features

1. **User Sign Up**
   - Email and password registration
   - Role selection (student, lecturer, admin)
   - Full name capture
   - User metadata storage
   - Automatic profile creation in `public.users` table

2. **User Sign In**
   - Email and password authentication
   - Session management with JWT tokens
   - Automatic token refresh
   - Session persistence across page reloads

3. **User Sign Out**
   - Clear session and tokens
   - Redirect to login page

4. **Password Management**
   - Password reset via email
   - Password update for authenticated users
   - Password strength validation:
     - Minimum 8 characters
     - At least one uppercase letter
     - At least one lowercase letter
     - At least one number

5. **Role-Based Access Control**
   - Three roles: student, lecturer, admin
   - Role stored in user metadata and `public.users` table
   - Helper functions for role checking
   - Server-side and client-side role validation

6. **Session Management**
   - HTTP-only cookies for security
   - PKCE flow for enhanced security
   - Automatic token refresh
   - Session detection in URL (for OAuth callbacks)

## API Reference

### Client-Side Functions (`src/lib/auth.ts`)

```typescript
// Sign up a new user
signUp(email: string, password: string, fullName: string, role: UserRole): Promise<AuthResponse>

// Sign in an existing user
signIn(email: string, password: string): Promise<AuthResponse>

// Sign out the current user
signOut(): Promise<AuthError | null>

// Get current user
getCurrentUser(): Promise<User | null>

// Get current session
getSession(): Promise<Session | null>

// Get user role
getUserRole(): Promise<UserRole | null>

// Check if user has specific role
hasRole(role: UserRole): Promise<boolean>

// Role checking shortcuts
isStudent(): Promise<boolean>
isLecturer(): Promise<boolean>
isAdmin(): Promise<boolean>
isLecturerOrAdmin(): Promise<boolean>

// Password management
resetPassword(email: string): Promise<AuthError | null>
updatePassword(newPassword: string): Promise<AuthError | null>

// Validation helpers
isValidEmail(email: string): boolean
validatePassword(password: string): { isValid: boolean; message: string }

// Subscribe to auth state changes
onAuthStateChange(callback: (user: User | null) => void): () => void
```

### Server-Side Functions (`src/lib/auth-server.ts`)

All client-side functions with `Server` suffix, plus:

```typescript
// Require authentication (throws if not authenticated)
requireAuthServer(): Promise<User>

// Require specific role (throws if not authorized)
requireRoleServer(role: UserRole): Promise<User>

// Require lecturer or admin role
requireLecturerOrAdminServer(): Promise<User>
```

## Usage Examples

### Sign Up Example

```typescript
import { signUp, validatePassword, isValidEmail } from '@/lib/auth';

async function handleSignUp(email: string, password: string, fullName: string, role: 'student' | 'lecturer') {
  // Validate email
  if (!isValidEmail(email)) {
    return { error: 'Invalid email format' };
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return { error: passwordValidation.message };
  }

  // Sign up
  const { user, error } = await signUp(email, password, fullName, role);

  if (error) {
    return { error: error.message };
  }

  return { user };
}
```

### Sign In Example

```typescript
import { signIn } from '@/lib/auth';

async function handleSignIn(email: string, password: string) {
  const { user, error } = await signIn(email, password);

  if (error) {
    return { error: error.message };
  }

  // Redirect to dashboard
  window.location.href = '/dashboard';
}
```

### Protected Route Example (Client)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getUserRole } from '@/lib/auth';

export default function ProtectedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const role = await getUserRole();
      
      // Check if user has required role
      if (role !== 'lecturer' && role !== 'admin') {
        router.push('/unauthorized');
        return;
      }

      setLoading(false);
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <div>Protected Content</div>;
}
```

### Protected API Route Example (Server)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireLecturerOrAdminServer } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    // Require lecturer or admin role
    const user = await requireLecturerOrAdminServer();

    // User is authenticated and has required role
    return NextResponse.json({ data: 'Protected data' });

  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
```

## Troubleshooting

### Issue: "Database error saving new user"

**Solution**: Apply the users table trigger fix (see Step 2 above)

### Issue: "Email not confirmed"

**Solution**: 
1. Go to Supabase Dashboard > Authentication > Providers
2. Click on Email provider
3. Disable "Confirm email" for development
4. For production, keep it enabled and implement email confirmation flow

### Issue: "Invalid login credentials"

**Possible causes**:
- Wrong email or password
- User doesn't exist
- Email not confirmed (if confirmation is enabled)

**Solution**: 
- Verify credentials
- Check if user exists in Supabase Dashboard > Authentication > Users
- Confirm email if confirmation is enabled

### Issue: Session not persisting

**Solution**:
- Check that cookies are enabled in browser
- Verify `NEXT_PUBLIC_APP_URL` is set correctly
- Check browser console for errors

### Issue: Role not set correctly

**Solution**:
- Verify the trigger is working: Check `public.users` table
- Ensure role is passed correctly in `signUp()` function
- Check user metadata in Supabase Dashboard > Authentication > Users

## Security Considerations

### Development

- Email confirmation can be disabled for easier testing
- Use test email addresses
- Don't use real passwords

### Production

1. **Enable Email Confirmation**
   - Prevents fake account creation
   - Verifies email ownership

2. **Configure Password Policies**
   - Minimum password length
   - Password complexity requirements
   - Password history

3. **Set Up Rate Limiting**
   - Prevent brute force attacks
   - Limit sign up attempts
   - Limit password reset requests

4. **Use HTTPS**
   - Encrypt data in transit
   - Secure cookies

5. **Configure CORS**
   - Restrict allowed origins
   - Prevent unauthorized access

6. **Monitor Authentication**
   - Track failed login attempts
   - Monitor suspicious activity
   - Set up alerts

## Next Steps

After completing email/password authentication setup:

1. **Task 2.2**: Implement Row Level Security Policies
   - Create RLS policies for all tables
   - Test policies with different roles

2. **Task 2.3**: Create Authentication Pages
   - Build login page
   - Build registration page
   - Implement password reset flow
   - Create protected route wrapper

3. **Testing**
   - Test all authentication flows
   - Test role-based access control
   - Test error handling
   - Test session management

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)

## Support

For issues or questions:
- Check Supabase Dashboard logs
- Review browser console errors
- Check server logs
- Consult Supabase documentation
- Run diagnostic scripts (`configure-auth.js`, `test-email-auth.js`)

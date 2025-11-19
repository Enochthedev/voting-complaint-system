# JWT Role Configuration Guide

## Overview

This guide explains how to configure Supabase to include the user's role in their JWT token claims. This is essential for Row Level Security (RLS) policies that check `auth.jwt()->>'role'`.

## Current Implementation

### 1. Role Storage in User Metadata

When users sign up, their role is stored in two places:

1. **User Metadata** (`auth.users.raw_user_meta_data`): Stored during signup
2. **Public Users Table** (`public.users.role`): Copied by the `handle_new_user()` trigger

See `src/lib/auth.ts` - the `signUp()` function:

```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: fullName,
      role: role,  // ← Role stored in user_metadata
    },
  },
});
```

### 2. JWT Claims Hook

The migration `018_add_role_to_jwt_claims.sql` creates a function that adds the role to JWT claims:

```sql
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  user_role user_role;
BEGIN
  SELECT role INTO user_role
  FROM public.users
  WHERE id = (event->>'user_id')::uuid;

  IF user_role IS NOT NULL THEN
    event := jsonb_set(event, '{claims,role}', to_jsonb(user_role::text));
  END IF;

  RETURN event;
END;
$$;
```

## Configuration Steps

### Option 1: Supabase Dashboard (Recommended for Production)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Hooks**
4. Under **Custom Access Token Hook**, configure:
   - **Hook**: `custom_access_token_hook`
   - **Schema**: `public`
5. Click **Save**

### Option 2: Supabase CLI (For Local Development)

1. Edit `supabase/config.toml` and add:

```toml
[auth.hook.custom_access_token]
enabled = true
uri = "pg-functions://postgres/public/custom_access_token_hook"
```

2. Restart your local Supabase instance:

```bash
npx supabase stop
npx supabase start
```

### Option 3: SQL Direct Configuration (Advanced)

If using Supabase's SQL editor or direct database access:

```sql
-- The function is already created by migration 018
-- Just ensure it's properly configured in your Supabase project settings
```

## Applying the Migration

### Using Supabase CLI

```bash
# Apply all pending migrations
npx supabase db push --include-all

# Or apply specific migration
npx supabase migration up
```

### Using SQL Editor

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy the contents of `supabase/migrations/018_add_role_to_jwt_claims.sql`
3. Execute the SQL

## Verification

### 1. Test the Function

Run this in the SQL Editor:

```sql
SELECT public.custom_access_token_hook(
  jsonb_build_object(
    'user_id', 'YOUR_USER_ID_HERE',
    'claims', '{}'::jsonb
  )
);
```

You should see the role added to the claims.

### 2. Test JWT Claims

After configuring the hook:

1. Sign out and sign in again (existing sessions won't have the new claims)
2. In your browser console, check the JWT:

```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log(session.access_token);

// Decode the JWT at https://jwt.io
// You should see "role": "student" (or "lecturer"/"admin") in the claims
```

### 3. Test RLS Policies

Try accessing data that requires role-based permissions:

```javascript
// This should work for lecturers/admins, fail for students
const { data, error } = await supabase
  .from('complaints')
  .select('*');
```

## Troubleshooting

### Issue: Role not appearing in JWT

**Solution**: Users must sign out and sign in again after configuring the hook. Existing sessions won't automatically get the new claims.

```javascript
await supabase.auth.signOut();
// Then sign in again
```

### Issue: RLS policies failing with "permission denied"

**Possible causes**:
1. Hook not configured in Supabase Dashboard
2. User hasn't signed in again after hook configuration
3. Function not granted proper permissions

**Check**:
```sql
-- Verify function exists and has correct permissions
SELECT routine_name, routine_schema
FROM information_schema.routines
WHERE routine_name = 'custom_access_token_hook';

-- Check grants
SELECT grantee, privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'custom_access_token_hook';
```

### Issue: Function not found

**Solution**: Apply the migration:

```bash
npx supabase db push --include-all
```

Or manually run the SQL from `supabase/migrations/018_add_role_to_jwt_claims.sql`.

## Important Notes

1. **Session Refresh Required**: After configuring the hook, all users must sign out and sign in again
2. **Security**: The function runs with `STABLE` security to ensure it can read from the users table
3. **Performance**: The function is called on every token refresh, so it's optimized to be fast
4. **Fallback**: If the role is not found in `public.users`, the JWT won't include the role claim

## Alternative: Using User Metadata Directly

If you prefer not to use the JWT hook, you can modify RLS policies to read from user metadata:

```sql
-- Instead of: auth.jwt()->>'role'
-- Use: (SELECT role FROM public.users WHERE id = auth.uid())

CREATE POLICY "Students view own complaints"
ON complaints FOR SELECT
TO authenticated
USING (
  student_id = auth.uid() OR 
  (SELECT role FROM public.users WHERE id = auth.uid()) IN ('lecturer', 'admin')
);
```

However, this is less efficient as it requires a subquery for each policy check.

## References

- [Supabase Auth Hooks Documentation](https://supabase.com/docs/guides/auth/auth-hooks)
- [Custom Claims in JWT](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

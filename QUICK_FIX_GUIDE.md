# Quick Fix Guide

This guide will help you apply all security fixes to the complaint-system.

## Step 1: Verify Files Created

The following files have been created/modified:

✅ `/middleware.ts` - New middleware for route protection
✅ `supabase/migrations/035_final_secure_user_creation.sql` - Security migration
✅ `src/lib/auth.ts` - Updated to use database roles
✅ `src/lib/auth-server.ts` - Updated to use database roles
✅ `SECURITY_AUDIT_REPORT.md` - Full security audit documentation

## Step 2: Apply Database Migration

```bash
cd /Users/user/Dev/complaint-system

# Make sure you have supabase CLI installed
# If not: npm install -g supabase

# Login to Supabase (if not already)
supabase login

# Link your project (if not already linked)
supabase link --project-ref <your-project-ref>

# Apply the migration
supabase db push
```

**Alternative:** Apply migration manually via Supabase Dashboard:
1. Go to: https://app.supabase.com/project/<your-project>/sql
2. Paste contents of `supabase/migrations/035_final_secure_user_creation.sql`
3. Click "Run"

## Step 3: Restart Development Server

```bash
# Stop current dev server (Ctrl+C)

# Restart to load new middleware
npm run dev
```

## Step 4: Test the Fixes

### Test 1: Route Protection
1. Open browser in incognito mode
2. Navigate to: `http://localhost:3001/dashboard`
3. ✅ Should redirect to `/login`

### Test 2: Authentication
1. Login with valid credentials
2. ✅ Should redirect to `/dashboard`
3. Access should be granted

### Test 3: Role-Based Access
1. Login as student
2. Try to access: `http://localhost:3001/admin`
3. ✅ Should redirect to `/dashboard?error=unauthorized`

### Test 4: Secure User Creation
1. Create new user via `/register`
2. Check database:
   ```sql
   SELECT id, email, role FROM public.users 
   WHERE email = 'newuser@example.com';
   ```
3. ✅ Role should be 'student'

## Step 5: Optional - Audit Existing Users

Run this SQL query to check for any suspicious user roles:

```sql
SELECT 
  id, 
  email, 
  role, 
  created_at,
  updated_at
FROM public.users 
WHERE role IN ('admin', 'lecturer')
ORDER BY created_at DESC;
```

Review the results and verify only legitimate users have elevated roles.

## What's Been Fixed?

### Before:
❌ No server-side route protection
❌ Users could escalate privileges via signup metadata
❌ Roles stored in untrusted user metadata
❌ Client-side only authentication checks

### After:
✅ Server-side middleware protects all routes
✅ All new users get 'student' role (cannot escalate)
✅ Roles stored in database (single source of truth)
✅ Role-based access control enforced

## Need Help?

If you encounter any issues:

1. Check console for errors
2. Verify environment variables are set
3. Ensure database connection is working
4. Review `SECURITY_AUDIT_REPORT.md` for details

## Important Notes

⚠️ **Breaking Change:** If you have existing users with roles stored in `user_metadata`, they will need to be migrated to the `public.users` table.

⚠️ **Sessions:** Existing user sessions will continue to work, but role checks will now query the database.

⚠️ **Performance:** Role is fetched from database on each request. Consider implementing caching if performance becomes an issue.

## Admin Tasks

To upgrade a user's role (admin only):

```sql
-- Must be run by an admin or via admin panel
SELECT update_user_role(
  '<user_id>'::uuid, 
  'lecturer'::user_role
);
```

You should build an admin UI for this instead of running SQL directly.

## Verification Checklist

- [ ] Migration applied successfully
- [ ] Server restarted with middleware
- [ ] Protected routes redirect unauthenticated users
- [ ] Role-based routes enforce permissions
- [ ] New users receive 'student' role
- [ ] Existing admin users can still access admin panel
- [ ] No console errors on page load

---

**Last Updated:** 2025-11-25
**Version:** 1.0.0

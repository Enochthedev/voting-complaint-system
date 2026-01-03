# Fix for Feedback Not Showing on Student Pages

## Problem
Students cannot see feedback and comments from lecturers/admins on their complaints. This is because the JWT role claim hook is not configured in Supabase.

## Solution

### Step 1: Enable the Custom Access Token Hook in Supabase

The JWT role claim hook needs to be manually enabled in your Supabase project settings:

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **Hooks**
4. Find the **"Custom Access Token"** hook
5. Enable it and set the hook to call the function: `public.custom_access_token_hook`
6. Save the configuration

### Step 2: Verify the Setup

Run the verification script in your Supabase SQL Editor:

```bash
# Open the Supabase SQL Editor in your dashboard
# Copy and paste the contents of: supabase/verify-setup.sql
# Run the script
```

The script will check:
- ✓ If the custom_access_token_hook function exists
- ✓ If RLS is enabled on feedback and comments tables
- ✓ If RLS policies are correctly configured
- ✓ If JWT role matches the database role

### Step 3: Test with a Student Account

1. Log out of your current account
2. Log in as a student
3. View a complaint that has feedback from a lecturer
4. You should now be able to see the feedback

## Alternative: Quick Database Fix

If you can't access the Supabase dashboard, you can run this SQL migration directly in your database:

```sql
-- Apply all necessary migrations
\i supabase/migrations/018_add_role_to_jwt_claims.sql
\i supabase/migrations/024_fix_feedback_rls.sql
\i supabase/migrations/022_fix_complaint_comments_rls.sql
```

## How It Works

The issue is caused by Row Level Security (RLS) policies that check the user's role. The policies use `auth.jwt()->>'role'` to determine if a user is a student, lecturer, or admin.

For this to work:
1. The `custom_access_token_hook` function adds the user's role from the database to their JWT token
2. The hook must be registered in Supabase Auth settings
3. When a user logs in, their JWT includes the role claim
4. RLS policies can then check `auth.jwt()->>'role'` without querying the database

Without the hook enabled, `auth.jwt()->>'role'` returns `null`, so students can't see feedback even though the RLS policy should allow it.

## Troubleshooting

### Students still can't see feedback after enabling the hook

1. **Clear browser cache and local storage**
   - The old JWT without the role claim might be cached
   - Have students log out and log back in

2. **Verify the hook is working**
   - Run the verification script in Step 2
   - Check that "JWT role matches database role" shows ✓

3. **Check if feedback exists**
   - Log in as a lecturer/admin
   - View the same complaint
   - Verify that feedback was actually added

4. **Check browser console for errors**
   - Open Developer Tools (F12)
   - Check the Console tab for any API errors
   - Look for RLS policy violations

### Error: "infinite recursion detected in policy for relation"

This means the old RLS policies (that query the users table) are still active. Run these migrations:
```sql
\i supabase/migrations/024_fix_feedback_rls.sql
\i supabase/migrations/022_fix_complaint_comments_rls.sql
```

## Files Modified

- ✅ `src/lib/api/complaints.ts` - Added missing `updated_at` and `lecturer_id` fields to feedback query
- ✅ `supabase/verify-setup.sql` - Created verification script
- ✅ `FEEDBACK_FIX_README.md` - This documentation file

# Apply Announcements RLS Fix

## Issue
The announcements table RLS policies were causing infinite recursion because they queried the `users` table to check roles. This creates a circular dependency when the users table also has RLS policies.

## Solution
Update the announcements RLS policies to use JWT claims (`auth.jwt()->>'role'`) instead of querying the users table.

## How to Apply

### Option 1: Using Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/026_fix_announcements_rls.sql`
5. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

```bash
cd student-complaint-system
supabase db push
```

This will apply all pending migrations including the announcements RLS fix.

## Verification

After applying the fix, run the test script to verify all RLS policies work correctly:

```bash
node scripts/test-announcements-rls.js
```

Expected output:
```
✅ SELECT permissions: PASS
✅ INSERT permissions: PASS
✅ UPDATE permissions: PASS
✅ DELETE permissions: PASS
```

## What Changed

### Before (Caused Infinite Recursion)
```sql
CREATE POLICY "Lecturers create announcements"
  ON public.announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users  -- ❌ Queries users table
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  );
```

### After (Uses JWT Claims)
```sql
CREATE POLICY "Lecturers create announcements"
  ON public.announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt()->>'role' IN ('lecturer', 'admin')  -- ✅ Uses JWT claims
  );
```

## Policies Updated

1. **Lecturers create announcements** (INSERT)
   - Now uses JWT claims to check role
   
2. **Lecturers update own announcements** (UPDATE)
   - Now uses JWT claims to check role
   - Still verifies ownership with `created_by = auth.uid()`
   
3. **Lecturers delete own announcements** (DELETE)
   - Now uses JWT claims to check role
   - Still verifies ownership with `created_by = auth.uid()`

## Related Files

- Migration: `supabase/migrations/026_fix_announcements_rls.sql`
- Test Script: `scripts/test-announcements-rls.js`
- Original Migration: `supabase/migrations/014_create_announcements_table.sql`

## Notes

- The SELECT policy ("All users view announcements") was not changed as it doesn't check roles
- JWT claims are populated by the `018_add_role_to_jwt_claims.sql` migration
- This pattern should be used for all RLS policies that need to check user roles

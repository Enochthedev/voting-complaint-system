-- Verification script for Supabase setup
-- Run this script to verify that all necessary components are in place

-- 1. Verify that the custom_access_token_hook function exists
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_proc
      WHERE proname = 'custom_access_token_hook'
    )
    THEN '✓ custom_access_token_hook function exists'
    ELSE '✗ custom_access_token_hook function is missing - run migration 018'
  END AS status;

-- 2. Verify that RLS is enabled on feedback table
SELECT
  CASE
    WHEN relrowsecurity
    THEN '✓ RLS is enabled on feedback table'
    ELSE '✗ RLS is NOT enabled on feedback table'
  END AS status
FROM pg_class
WHERE relname = 'feedback';

-- 3. Verify that feedback RLS policies exist
SELECT
  CASE
    WHEN COUNT(*) >= 4
    THEN '✓ Feedback RLS policies exist (' || COUNT(*) || ' policies)'
    ELSE '✗ Missing feedback RLS policies (found ' || COUNT(*) || ', expected 4+)'
  END AS status
FROM pg_policies
WHERE tablename = 'feedback';

-- 4. List all feedback policies (for debugging)
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'feedback';

-- 5. Verify that comments RLS policies exist
SELECT
  CASE
    WHEN COUNT(*) >= 5
    THEN '✓ Comments RLS policies exist (' || COUNT(*) || ' policies)'
    ELSE '✗ Missing comments RLS policies (found ' || COUNT(*) || ', expected 5+)'
  END AS status
FROM pg_policies
WHERE tablename = 'complaint_comments';

-- 6. Test JWT role claim for current user
SELECT
  auth.uid() as user_id,
  auth.jwt()->>'role' as jwt_role,
  u.role as db_role,
  CASE
    WHEN auth.jwt()->>'role' = u.role::text
    THEN '✓ JWT role matches database role'
    ELSE '✗ JWT role does NOT match database role - hook not configured'
  END AS status
FROM users u
WHERE u.id = auth.uid();

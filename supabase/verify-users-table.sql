-- Verification script for users table migration
-- Run this in Supabase SQL Editor to verify the migration was successful

-- 1. Check if users table exists
SELECT 
  'Users table exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 2. Check if user_role enum exists
SELECT 
  'user_role enum exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_type 
      WHERE typname = 'user_role'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 3. Check enum values
SELECT 
  'user_role enum values' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM pg_enum 
      WHERE enumtypid = 'user_role'::regtype
    ) = 3 THEN '✓ PASS (3 values: student, lecturer, admin)'
    ELSE '✗ FAIL'
  END as status;

-- 4. Check table columns
SELECT 
  'Users table has all columns' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
      AND column_name IN ('id', 'email', 'role', 'full_name', 'created_at', 'updated_at')
    ) = 6 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 5. Check RLS is enabled
SELECT 
  'RLS enabled on users table' as check_name,
  CASE 
    WHEN (
      SELECT relrowsecurity 
      FROM pg_class 
      WHERE relname = 'users' 
      AND relnamespace = 'public'::regnamespace
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 6. Check RLS policies exist
SELECT 
  'RLS policies exist' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM pg_policies 
      WHERE tablename = 'users'
    ) >= 3 THEN '✓ PASS (3+ policies)'
    ELSE '✗ FAIL'
  END as status;

-- 7. Check trigger exists
SELECT 
  'on_auth_user_created trigger exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_trigger 
      WHERE tgname = 'on_auth_user_created'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 8. Check update trigger exists
SELECT 
  'update_users_updated_at trigger exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_trigger 
      WHERE tgname = 'update_users_updated_at'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 9. Check functions exist
SELECT 
  'handle_new_user function exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_proc 
      WHERE proname = 'handle_new_user'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

SELECT 
  'update_updated_at_column function exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_proc 
      WHERE proname = 'update_updated_at_column'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 10. Check indexes exist
SELECT 
  'Indexes on users table' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM pg_indexes 
      WHERE tablename = 'users' 
      AND schemaname = 'public'
    ) >= 2 THEN '✓ PASS (2+ indexes)'
    ELSE '✗ FAIL'
  END as status;

-- Summary: List all columns
SELECT 
  '--- Column Details ---' as info,
  '' as details
UNION ALL
SELECT 
  column_name,
  data_type || CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Summary: List all policies
SELECT 
  '--- RLS Policies ---' as info,
  '' as details
UNION ALL
SELECT 
  policyname,
  cmd::text
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- Summary: List all triggers
SELECT 
  '--- Triggers ---' as info,
  '' as details
UNION ALL
SELECT 
  trigger_name,
  event_manipulation
FROM information_schema.triggers 
WHERE event_object_table = 'users'
ORDER BY trigger_name;

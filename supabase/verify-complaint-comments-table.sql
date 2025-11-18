-- Verification script for complaint_comments table
-- Run this after applying the 006_create_complaint_comments_table.sql migration

-- 1. Check if complaint_comments table exists
SELECT 
  'complaint_comments table exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'complaint_comments'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 2. Check table columns
SELECT 
  'complaint_comments table has all columns' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM information_schema.columns 
      WHERE table_name = 'complaint_comments' 
      AND table_schema = 'public'
      AND column_name IN ('id', 'complaint_id', 'user_id', 'comment', 'is_internal', 'created_at', 'updated_at')
    ) = 7 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 3. Check RLS is enabled
SELECT 
  'RLS enabled on complaint_comments table' as check_name,
  CASE 
    WHEN (
      SELECT relrowsecurity 
      FROM pg_class 
      WHERE relname = 'complaint_comments' 
      AND relnamespace = 'public'::regnamespace
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 4. Check RLS policies exist
SELECT 
  'RLS policies exist' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM pg_policies 
      WHERE tablename = 'complaint_comments'
    ) >= 5 THEN '✓ PASS (5+ policies)'
    ELSE '✗ FAIL'
  END as status;

-- 5. Check foreign key constraints exist
SELECT 
  'Foreign key to complaints table' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.complaint_comments'::regclass
      AND contype = 'f'
      AND confrelid = 'public.complaints'::regclass
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 6. Check foreign key to users table
SELECT 
  'Foreign key to users table' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.complaint_comments'::regclass
      AND contype = 'f'
      AND confrelid = 'public.users'::regclass
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 7. Check non-empty comment constraint
SELECT 
  'Non-empty comment constraint exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.complaint_comments'::regclass
      AND contype = 'c'
      AND conname = 'non_empty_comment'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 8. Check indexes exist
SELECT 
  'Indexes on complaint_comments table' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM pg_indexes 
      WHERE tablename = 'complaint_comments' 
      AND schemaname = 'public'
    ) >= 5 THEN '✓ PASS (5+ indexes)'
    ELSE '✗ FAIL'
  END as status;

-- 9. Check updated_at trigger exists
SELECT 
  'Updated_at trigger exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_trigger
      WHERE tgrelid = 'public.complaint_comments'::regclass
      AND tgname = 'update_complaint_comments_updated_at'
    ) THEN '✓ PASS'
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
WHERE table_name = 'complaint_comments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Summary: List all indexes
SELECT 
  '--- Indexes ---' as info,
  '' as details
UNION ALL
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'complaint_comments'
AND schemaname = 'public'
ORDER BY indexname;

-- Summary: List all constraints
SELECT 
  '--- Constraints ---' as info,
  '' as details
UNION ALL
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.complaint_comments'::regclass
ORDER BY conname;

-- Summary: List all RLS policies
SELECT 
  '--- RLS Policies ---' as info,
  '' as details
UNION ALL
SELECT 
  policyname,
  cmd::text
FROM pg_policies 
WHERE tablename = 'complaint_comments'
ORDER BY policyname;

-- Summary: List all triggers
SELECT 
  '--- Triggers ---' as info,
  '' as details
UNION ALL
SELECT 
  tgname as trigger_name,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger
WHERE tgrelid = 'public.complaint_comments'::regclass
AND tgisinternal = false
ORDER BY tgname;

-- Final summary
SELECT 
  'complaint_comments table verification complete' as status,
  COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'complaint_comments' 
AND table_schema = 'public';

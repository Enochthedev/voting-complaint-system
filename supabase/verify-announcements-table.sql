-- Verification script for announcements table
-- Run this after applying the 014_create_announcements_table.sql migration

-- 1. Check if announcements table exists
SELECT 
  'announcements table exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'announcements'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 2. Check table columns
SELECT 
  'announcements table has all columns' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM information_schema.columns 
      WHERE table_name = 'announcements' 
      AND table_schema = 'public'
      AND column_name IN ('id', 'created_by', 'title', 'content', 'created_at', 'updated_at')
    ) = 6 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 3. Check RLS is enabled
SELECT 
  'RLS enabled on announcements table' as check_name,
  CASE 
    WHEN (
      SELECT relrowsecurity 
      FROM pg_class 
      WHERE relname = 'announcements' 
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
      WHERE tablename = 'announcements'
    ) >= 4 THEN '✓ PASS (4+ policies)'
    ELSE '✗ FAIL'
  END as status;

-- 5. Check foreign key constraint to users table
SELECT 
  'Foreign key to users table (created_by)' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.announcements'::regclass
      AND contype = 'f'
      AND confrelid = 'public.users'::regclass
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 6. Check non-empty title constraint
SELECT 
  'Non-empty title constraint exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.announcements'::regclass
      AND contype = 'c'
      AND conname = 'non_empty_title'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 7. Check non-empty content constraint
SELECT 
  'Non-empty content constraint exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.announcements'::regclass
      AND contype = 'c'
      AND conname = 'non_empty_content'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 8. Check indexes exist
SELECT 
  'Indexes on announcements table' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM pg_indexes 
      WHERE tablename = 'announcements' 
      AND schemaname = 'public'
    ) >= 3 THEN '✓ PASS (3+ indexes)'
    ELSE '✗ FAIL'
  END as status;

-- 9. Check created_at default value
SELECT 
  'created_at has default NOW()' as check_name,
  CASE 
    WHEN (
      SELECT column_default 
      FROM information_schema.columns 
      WHERE table_name = 'announcements' 
      AND column_name = 'created_at'
    ) LIKE '%now()%' THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 10. Check updated_at default value
SELECT 
  'updated_at has default NOW()' as check_name,
  CASE 
    WHEN (
      SELECT column_default 
      FROM information_schema.columns 
      WHERE table_name = 'announcements' 
      AND column_name = 'updated_at'
    ) LIKE '%now()%' THEN '✓ PASS'
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
WHERE table_name = 'announcements' 
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
WHERE tablename = 'announcements'
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
WHERE conrelid = 'public.announcements'::regclass
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
WHERE tablename = 'announcements'
ORDER BY policyname;

-- Final summary
SELECT 
  'announcements table verification complete' as status,
  COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'announcements' 
AND table_schema = 'public';

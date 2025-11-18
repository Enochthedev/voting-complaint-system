-- Verification script for complaint_ratings table
-- Run this after applying the 007_create_complaint_ratings_table.sql migration

-- 1. Check if complaint_ratings table exists
SELECT 
  'complaint_ratings table exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'complaint_ratings'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 2. Check table columns
SELECT 
  'complaint_ratings table has all columns' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM information_schema.columns 
      WHERE table_name = 'complaint_ratings' 
      AND table_schema = 'public'
      AND column_name IN ('id', 'complaint_id', 'student_id', 'rating', 'feedback_text', 'created_at')
    ) = 6 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 3. Check RLS is enabled
SELECT 
  'RLS enabled on complaint_ratings table' as check_name,
  CASE 
    WHEN (
      SELECT relrowsecurity 
      FROM pg_class 
      WHERE relname = 'complaint_ratings' 
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
      WHERE tablename = 'complaint_ratings'
    ) >= 3 THEN '✓ PASS (3+ policies)'
    ELSE '✗ FAIL'
  END as status;

-- 5. Check unique constraint exists
SELECT 
  'Unique constraint on complaint_id' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.complaint_ratings'::regclass
      AND contype = 'u'
      AND conname = 'unique_complaint_rating'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 6. Check rating range constraint exists
SELECT 
  'Rating range check constraint (1-5)' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.complaint_ratings'::regclass
      AND contype = 'c'
      AND conname = 'rating_range_check'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 7. Check foreign key constraints exist
SELECT 
  'Foreign key to complaints table' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.complaint_ratings'::regclass
      AND contype = 'f'
      AND confrelid = 'public.complaints'::regclass
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

SELECT 
  'Foreign key to users table' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.complaint_ratings'::regclass
      AND contype = 'f'
      AND confrelid = 'public.users'::regclass
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 8. Check indexes exist
SELECT 
  'Indexes on complaint_ratings table' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM pg_indexes 
      WHERE tablename = 'complaint_ratings' 
      AND schemaname = 'public'
    ) >= 4 THEN '✓ PASS (4+ indexes)'
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
WHERE table_name = 'complaint_ratings' 
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
WHERE tablename = 'complaint_ratings'
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
WHERE conrelid = 'public.complaint_ratings'::regclass
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
WHERE tablename = 'complaint_ratings'
ORDER BY policyname;

-- Final summary
SELECT 
  'complaint_ratings table verification complete' as status,
  COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'complaint_ratings' 
AND table_schema = 'public';

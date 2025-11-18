-- Verification script for complaint_tags table
-- Run this after applying the 003_create_complaint_tags_table.sql migration

-- 1. Check if complaint_tags table exists
SELECT 
  'complaint_tags table exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'complaint_tags'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 2. Check table columns
SELECT 
  'complaint_tags table has all columns' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM information_schema.columns 
      WHERE table_name = 'complaint_tags' 
      AND table_schema = 'public'
      AND column_name IN ('id', 'complaint_id', 'tag_name', 'created_at')
    ) = 4 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 3. Check RLS is enabled
SELECT 
  'RLS enabled on complaint_tags table' as check_name,
  CASE 
    WHEN (
      SELECT relrowsecurity 
      FROM pg_class 
      WHERE relname = 'complaint_tags' 
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
      WHERE tablename = 'complaint_tags'
    ) >= 5 THEN '✓ PASS (5+ policies)'
    ELSE '✗ FAIL'
  END as status;

-- 5. Check unique constraint exists
SELECT 
  'Unique constraint on (complaint_id, tag_name)' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.complaint_tags'::regclass
      AND contype = 'u'
      AND conname = 'unique_complaint_tag'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 6. Check foreign key constraint exists
SELECT 
  'Foreign key to complaints table' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.complaint_tags'::regclass
      AND contype = 'f'
      AND confrelid = 'public.complaints'::regclass
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 7. Check indexes exist
SELECT 
  'Indexes on complaint_tags table' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM pg_indexes 
      WHERE tablename = 'complaint_tags' 
      AND schemaname = 'public'
    ) >= 3 THEN '✓ PASS (3+ indexes)'
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
WHERE table_name = 'complaint_tags' 
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
WHERE tablename = 'complaint_tags'
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
WHERE conrelid = 'public.complaint_tags'::regclass
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
WHERE tablename = 'complaint_tags'
ORDER BY policyname;

-- Final summary
SELECT 
  'complaint_tags table verification complete' as status,
  COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'complaint_tags' 
AND table_schema = 'public';

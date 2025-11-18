-- Verification script for feedback table
-- Run this after applying the 010_create_feedback_table.sql migration

-- 1. Check if feedback table exists
SELECT 
  'feedback table exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'feedback'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 2. Check table columns
SELECT 
  'feedback table has all columns' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM information_schema.columns 
      WHERE table_name = 'feedback' 
      AND table_schema = 'public'
      AND column_name IN ('id', 'complaint_id', 'lecturer_id', 'content', 'created_at', 'updated_at')
    ) = 6 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 3. Check RLS is enabled
SELECT 
  'RLS enabled on feedback table' as check_name,
  CASE 
    WHEN (
      SELECT relrowsecurity 
      FROM pg_class 
      WHERE relname = 'feedback' 
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
      WHERE tablename = 'feedback'
    ) >= 4 THEN '✓ PASS (4+ policies)'
    ELSE '✗ FAIL'
  END as status;

-- 5. Check foreign key constraints exist
SELECT 
  'Foreign key to complaints table' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.feedback'::regclass
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
      WHERE conrelid = 'public.feedback'::regclass
      AND contype = 'f'
      AND confrelid = 'public.users'::regclass
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 7. Check non-empty content constraint
SELECT 
  'Non-empty content constraint exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.feedback'::regclass
      AND contype = 'c'
      AND conname = 'non_empty_content'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 8. Check indexes exist
SELECT 
  'Indexes on feedback table' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM pg_indexes 
      WHERE tablename = 'feedback' 
      AND schemaname = 'public'
    ) >= 4 THEN '✓ PASS (4+ indexes)'
    ELSE '✗ FAIL'
  END as status;

-- 9. Check updated_at trigger exists
SELECT 
  'Updated_at trigger exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_trigger
      WHERE tgrelid = 'public.feedback'::regclass
      AND tgname = 'update_feedback_updated_at'
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
WHERE table_name = 'feedback' 
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
WHERE tablename = 'feedback'
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
WHERE conrelid = 'public.feedback'::regclass
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
WHERE tablename = 'feedback'
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
WHERE tgrelid = 'public.feedback'::regclass
AND tgisinternal = false
ORDER BY tgname;

-- Final summary
SELECT 
  'feedback table verification complete' as status,
  COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'feedback' 
AND table_schema = 'public';

-- Verification script for complaint_attachments table
-- Run this after applying the 004_create_complaint_attachments_table.sql migration

-- 1. Check if complaint_attachments table exists
SELECT 
  'complaint_attachments table exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'complaint_attachments'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 2. Check table columns
SELECT 
  'complaint_attachments table has all columns' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM information_schema.columns 
      WHERE table_name = 'complaint_attachments' 
      AND table_schema = 'public'
      AND column_name IN ('id', 'complaint_id', 'file_name', 'file_path', 'file_size', 'file_type', 'uploaded_by', 'created_at')
    ) = 8 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 3. Check RLS is enabled
SELECT 
  'RLS enabled on complaint_attachments table' as check_name,
  CASE 
    WHEN (
      SELECT relrowsecurity 
      FROM pg_class 
      WHERE relname = 'complaint_attachments' 
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
      WHERE tablename = 'complaint_attachments'
    ) >= 5 THEN '✓ PASS (5+ policies)'
    ELSE '✗ FAIL'
  END as status;

-- 5. Check file size constraints exist
SELECT 
  'File size constraints exist' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM pg_constraint
      WHERE conrelid = 'public.complaint_attachments'::regclass
      AND contype = 'c'
      AND conname IN ('positive_file_size', 'file_size_limit')
    ) = 2 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 6. Check foreign key constraints exist
SELECT 
  'Foreign keys to complaints and users tables' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM pg_constraint
      WHERE conrelid = 'public.complaint_attachments'::regclass
      AND contype = 'f'
    ) = 2 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 7. Check indexes exist
SELECT 
  'Indexes on complaint_attachments table' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM pg_indexes 
      WHERE tablename = 'complaint_attachments' 
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
WHERE table_name = 'complaint_attachments' 
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
WHERE tablename = 'complaint_attachments'
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
WHERE conrelid = 'public.complaint_attachments'::regclass
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
WHERE tablename = 'complaint_attachments'
ORDER BY policyname;

-- Final summary
SELECT 
  'complaint_attachments table verification complete' as status,
  COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'complaint_attachments' 
AND table_schema = 'public';

-- Verification script for votes table
-- Run this after applying the 012_create_votes_table.sql migration

-- 1. Check if votes table exists
SELECT 
  'votes table exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'votes'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 2. Check table columns
SELECT 
  'votes table has all columns' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM information_schema.columns 
      WHERE table_name = 'votes' 
      AND table_schema = 'public'
      AND column_name IN ('id', 'created_by', 'title', 'description', 'options', 'is_active', 'related_complaint_id', 'created_at', 'closes_at')
    ) = 9 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 3. Check RLS is enabled
SELECT 
  'RLS enabled on votes table' as check_name,
  CASE 
    WHEN (
      SELECT relrowsecurity 
      FROM pg_class 
      WHERE relname = 'votes' 
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
      WHERE tablename = 'votes'
    ) >= 4 THEN '✓ PASS (4+ policies)'
    ELSE '✗ FAIL'
  END as status;

-- 5. Check foreign key constraint to users table
SELECT 
  'Foreign key to users table (created_by)' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.votes'::regclass
      AND contype = 'f'
      AND confrelid = 'public.users'::regclass
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 6. Check foreign key constraint to complaints table
SELECT 
  'Foreign key to complaints table (related_complaint_id)' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.votes'::regclass
      AND contype = 'f'
      AND confrelid = 'public.complaints'::regclass
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 7. Check non-empty title constraint
SELECT 
  'Non-empty title constraint exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.votes'::regclass
      AND contype = 'c'
      AND conname = 'non_empty_title'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 8. Check non-empty options constraint
SELECT 
  'Non-empty options constraint exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.votes'::regclass
      AND contype = 'c'
      AND conname = 'non_empty_options'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 9. Check future closes_at constraint
SELECT 
  'Future closes_at constraint exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.votes'::regclass
      AND contype = 'c'
      AND conname = 'future_closes_at'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 10. Check indexes exist
SELECT 
  'Indexes on votes table' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM pg_indexes 
      WHERE tablename = 'votes' 
      AND schemaname = 'public'
    ) >= 6 THEN '✓ PASS (6+ indexes)'
    ELSE '✗ FAIL'
  END as status;

-- 11. Check is_active default value
SELECT 
  'is_active has default TRUE' as check_name,
  CASE 
    WHEN (
      SELECT column_default 
      FROM information_schema.columns 
      WHERE table_name = 'votes' 
      AND column_name = 'is_active'
    ) = 'true' THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 12. Check options column is JSONB
SELECT 
  'options column is JSONB type' as check_name,
  CASE 
    WHEN (
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'votes' 
      AND column_name = 'options'
    ) = 'jsonb' THEN '✓ PASS'
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
WHERE table_name = 'votes' 
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
WHERE tablename = 'votes'
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
WHERE conrelid = 'public.votes'::regclass
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
WHERE tablename = 'votes'
ORDER BY policyname;

-- Final summary
SELECT 
  'votes table verification complete' as status,
  COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'votes' 
AND table_schema = 'public';

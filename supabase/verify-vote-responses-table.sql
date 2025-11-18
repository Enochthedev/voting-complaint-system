-- Verification script for vote_responses table
-- Run this after applying the 013_create_vote_responses_table.sql migration

-- 1. Check if vote_responses table exists
SELECT 
  'vote_responses table exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'vote_responses'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 2. Check table columns
SELECT 
  'vote_responses table has all columns' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM information_schema.columns 
      WHERE table_name = 'vote_responses' 
      AND table_schema = 'public'
      AND column_name IN ('id', 'vote_id', 'student_id', 'selected_option', 'created_at')
    ) = 5 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 3. Check RLS is enabled
SELECT 
  'RLS enabled on vote_responses table' as check_name,
  CASE 
    WHEN (
      SELECT relrowsecurity 
      FROM pg_class 
      WHERE relname = 'vote_responses' 
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
      WHERE tablename = 'vote_responses'
    ) >= 4 THEN '✓ PASS (4+ policies)'
    ELSE '✗ FAIL'
  END as status;

-- 5. Check foreign key constraint to votes table
SELECT 
  'Foreign key to votes table (vote_id)' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.vote_responses'::regclass
      AND contype = 'f'
      AND confrelid = 'public.votes'::regclass
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 6. Check foreign key constraint to users table
SELECT 
  'Foreign key to users table (student_id)' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.vote_responses'::regclass
      AND contype = 'f'
      AND confrelid = 'public.users'::regclass
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 7. Check non-empty selected_option constraint
SELECT 
  'Non-empty selected_option constraint exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.vote_responses'::regclass
      AND contype = 'c'
      AND conname = 'non_empty_selected_option'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 8. Check unique vote per student constraint
SELECT 
  'Unique vote per student constraint exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.vote_responses'::regclass
      AND contype = 'u'
      AND conname = 'unique_vote_per_student'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 9. Check indexes exist
SELECT 
  'Indexes on vote_responses table' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM pg_indexes 
      WHERE tablename = 'vote_responses' 
      AND schemaname = 'public'
    ) >= 4 THEN '✓ PASS (4+ indexes)'
    ELSE '✗ FAIL'
  END as status;

-- 10. Verify UNIQUE constraint on (vote_id, student_id)
SELECT 
  'UNIQUE constraint on (vote_id, student_id)' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint c
      JOIN pg_attribute a1 ON a1.attrelid = c.conrelid AND a1.attnum = ANY(c.conkey)
      WHERE c.conrelid = 'public.vote_responses'::regclass
      AND c.contype = 'u'
      AND c.conname = 'unique_vote_per_student'
      AND ARRAY['vote_id', 'student_id']::text[] <@ ARRAY(
        SELECT a2.attname 
        FROM pg_attribute a2 
        WHERE a2.attrelid = c.conrelid 
        AND a2.attnum = ANY(c.conkey)
      )
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
WHERE table_name = 'vote_responses' 
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
WHERE tablename = 'vote_responses'
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
WHERE conrelid = 'public.vote_responses'::regclass
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
WHERE tablename = 'vote_responses'
ORDER BY policyname;

-- Final summary
SELECT 
  'vote_responses table verification complete' as status,
  COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'vote_responses' 
AND table_schema = 'public';

-- Verification script for complaints table
-- Run this after applying the 002_create_complaints_table.sql migration

-- Check if complaints table exists
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'complaints' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if enums were created
SELECT 
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('complaint_category', 'complaint_priority', 'complaint_status')
ORDER BY t.typname, e.enumsortorder;

-- Check indexes on complaints table
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'complaints'
AND schemaname = 'public'
ORDER BY indexname;

-- Check constraints on complaints table
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.complaints'::regclass
ORDER BY conname;

-- Check triggers on complaints table
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'complaints'
AND event_object_schema = 'public'
ORDER BY trigger_name;

-- Check RLS policies on complaints table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'complaints'
AND schemaname = 'public'
ORDER BY policyname;

-- Verify RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'complaints'
AND schemaname = 'public';

-- Test data integrity constraints
-- This should succeed (valid anonymous complaint)
DO $$
BEGIN
  -- Test anonymous complaint constraint
  INSERT INTO public.complaints (
    student_id,
    is_anonymous,
    is_draft,
    title,
    description,
    category,
    priority,
    status
  ) VALUES (
    NULL,
    true,
    false,
    'Test Anonymous Complaint',
    'This is a test anonymous complaint',
    'academic',
    'medium',
    'new'
  );
  
  -- Clean up test data
  DELETE FROM public.complaints WHERE title = 'Test Anonymous Complaint';
  
  RAISE NOTICE 'Anonymous complaint constraint test: PASSED';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Anonymous complaint constraint test: FAILED - %', SQLERRM;
END $$;

-- This should fail (anonymous with student_id)
DO $$
BEGIN
  INSERT INTO public.complaints (
    student_id,
    is_anonymous,
    is_draft,
    title,
    description,
    category,
    priority,
    status
  ) VALUES (
    gen_random_uuid(),
    true,
    false,
    'Invalid Test',
    'This should fail',
    'academic',
    'medium',
    'new'
  );
  
  RAISE NOTICE 'Anonymous constraint violation test: FAILED (should have been rejected)';
  DELETE FROM public.complaints WHERE title = 'Invalid Test';
EXCEPTION
  WHEN check_violation THEN
    RAISE NOTICE 'Anonymous constraint violation test: PASSED (correctly rejected)';
  WHEN OTHERS THEN
    RAISE NOTICE 'Anonymous constraint violation test: FAILED - %', SQLERRM;
END $$;

-- Test draft status constraint
DO $$
BEGIN
  INSERT INTO public.complaints (
    student_id,
    is_anonymous,
    is_draft,
    title,
    description,
    category,
    priority,
    status
  ) VALUES (
    NULL,
    true,
    true,
    'Test Draft',
    'This is a test draft',
    'academic',
    'medium',
    'draft'
  );
  
  DELETE FROM public.complaints WHERE title = 'Test Draft';
  RAISE NOTICE 'Draft status constraint test: PASSED';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Draft status constraint test: FAILED - %', SQLERRM;
END $$;

-- Summary
SELECT 
  'Complaints table verification complete' as status,
  COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'complaints' 
AND table_schema = 'public';

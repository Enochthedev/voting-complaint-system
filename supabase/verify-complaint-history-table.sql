-- Verification script for complaint_history table
-- Run this after applying the 005_create_complaint_history_table.sql migration

-- Check if complaint_history table exists
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'complaint_history' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if complaint_action enum was created
SELECT 
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'complaint_action'
ORDER BY e.enumsortorder;

-- Check indexes on complaint_history table
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'complaint_history'
AND schemaname = 'public'
ORDER BY indexname;

-- Check constraints on complaint_history table
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.complaint_history'::regclass
ORDER BY conname;

-- Check RLS policies on complaint_history table
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
WHERE tablename = 'complaint_history'
AND schemaname = 'public'
ORDER BY policyname;

-- Verify RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'complaint_history'
AND schemaname = 'public';

-- Check table permissions (should only allow SELECT and INSERT, not UPDATE or DELETE)
SELECT
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'complaint_history'
AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- Test data insertion (requires a complaint to exist)
DO $$
DECLARE
  test_complaint_id UUID;
  test_user_id UUID;
BEGIN
  -- Create a test complaint first
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
    'Test Complaint for History',
    'This is a test complaint for history verification',
    'academic',
    'medium',
    'new'
  ) RETURNING id INTO test_complaint_id;
  
  -- Insert a history record
  INSERT INTO public.complaint_history (
    complaint_id,
    action,
    old_value,
    new_value,
    performed_by,
    details
  ) VALUES (
    test_complaint_id,
    'created',
    NULL,
    'new',
    NULL,
    '{"source": "verification_test"}'::jsonb
  );
  
  -- Verify the history record was created
  IF EXISTS (
    SELECT 1 FROM public.complaint_history 
    WHERE complaint_id = test_complaint_id 
    AND action = 'created'
  ) THEN
    RAISE NOTICE 'History record insertion test: PASSED';
  ELSE
    RAISE NOTICE 'History record insertion test: FAILED';
  END IF;
  
  -- Clean up test data
  DELETE FROM public.complaint_history WHERE complaint_id = test_complaint_id;
  DELETE FROM public.complaints WHERE id = test_complaint_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'History record insertion test: FAILED - %', SQLERRM;
    -- Attempt cleanup
    IF test_complaint_id IS NOT NULL THEN
      DELETE FROM public.complaint_history WHERE complaint_id = test_complaint_id;
      DELETE FROM public.complaints WHERE id = test_complaint_id;
    END IF;
END $$;

-- Test immutability (UPDATE should be prevented by permissions)
DO $$
DECLARE
  test_complaint_id UUID;
  test_history_id UUID;
BEGIN
  -- Create a test complaint
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
    'Test Complaint for Immutability',
    'Testing history immutability',
    'academic',
    'medium',
    'new'
  ) RETURNING id INTO test_complaint_id;
  
  -- Insert a history record
  INSERT INTO public.complaint_history (
    complaint_id,
    action,
    old_value,
    new_value
  ) VALUES (
    test_complaint_id,
    'created',
    NULL,
    'new'
  ) RETURNING id INTO test_history_id;
  
  -- Attempt to update (this should fail due to permissions)
  UPDATE public.complaint_history 
  SET action = 'status_changed' 
  WHERE id = test_history_id;
  
  -- If we get here, the update succeeded (which is bad for immutability)
  RAISE NOTICE 'History immutability test: WARNING - Update was allowed (check permissions)';
  
  -- Clean up
  DELETE FROM public.complaint_history WHERE complaint_id = test_complaint_id;
  DELETE FROM public.complaints WHERE id = test_complaint_id;
  
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'History immutability test: PASSED (update correctly prevented)';
    -- Clean up
    IF test_complaint_id IS NOT NULL THEN
      DELETE FROM public.complaint_history WHERE complaint_id = test_complaint_id;
      DELETE FROM public.complaints WHERE id = test_complaint_id;
    END IF;
  WHEN OTHERS THEN
    RAISE NOTICE 'History immutability test: FAILED - %', SQLERRM;
    -- Clean up
    IF test_complaint_id IS NOT NULL THEN
      DELETE FROM public.complaint_history WHERE complaint_id = test_complaint_id;
      DELETE FROM public.complaints WHERE id = test_complaint_id;
    END IF;
END $$;

-- Test cascade deletion (history should be deleted when complaint is deleted)
DO $$
DECLARE
  test_complaint_id UUID;
  history_count INTEGER;
BEGIN
  -- Create a test complaint
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
    'Test Complaint for Cascade',
    'Testing cascade deletion',
    'academic',
    'medium',
    'new'
  ) RETURNING id INTO test_complaint_id;
  
  -- Insert history records
  INSERT INTO public.complaint_history (complaint_id, action)
  VALUES (test_complaint_id, 'created');
  
  INSERT INTO public.complaint_history (complaint_id, action, old_value, new_value)
  VALUES (test_complaint_id, 'status_changed', 'new', 'opened');
  
  -- Delete the complaint
  DELETE FROM public.complaints WHERE id = test_complaint_id;
  
  -- Check if history records were also deleted
  SELECT COUNT(*) INTO history_count
  FROM public.complaint_history
  WHERE complaint_id = test_complaint_id;
  
  IF history_count = 0 THEN
    RAISE NOTICE 'Cascade deletion test: PASSED';
  ELSE
    RAISE NOTICE 'Cascade deletion test: FAILED (% history records remain)', history_count;
    -- Clean up remaining records
    DELETE FROM public.complaint_history WHERE complaint_id = test_complaint_id;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Cascade deletion test: FAILED - %', SQLERRM;
    -- Attempt cleanup
    IF test_complaint_id IS NOT NULL THEN
      DELETE FROM public.complaint_history WHERE complaint_id = test_complaint_id;
      DELETE FROM public.complaints WHERE id = test_complaint_id;
    END IF;
END $$;

-- Summary
SELECT 
  'Complaint history table verification complete' as status,
  COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'complaint_history' 
AND table_schema = 'public';

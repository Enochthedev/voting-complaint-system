-- Verification script for complaint_history RLS policies
-- This script checks that the RLS policies are correctly configured

-- Check if RLS is enabled on complaint_history table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'complaint_history';

-- List all policies on complaint_history table
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
WHERE schemaname = 'public' AND tablename = 'complaint_history'
ORDER BY policyname;

-- Check table permissions
SELECT 
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
  AND table_name = 'complaint_history'
  AND grantee = 'authenticated'
ORDER BY privilege_type;

-- Verify that UPDATE and DELETE are not granted
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.table_privileges
      WHERE table_schema = 'public' 
        AND table_name = 'complaint_history'
        AND grantee = 'authenticated'
        AND privilege_type IN ('UPDATE', 'DELETE')
    ) THEN 'FAIL: UPDATE or DELETE permissions found'
    ELSE 'PASS: No UPDATE or DELETE permissions'
  END AS immutability_check;

-- Verify that SELECT and INSERT are granted
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.table_privileges
      WHERE table_schema = 'public' 
        AND table_name = 'complaint_history'
        AND grantee = 'authenticated'
        AND privilege_type = 'SELECT'
    ) AND EXISTS (
      SELECT 1 
      FROM information_schema.table_privileges
      WHERE table_schema = 'public' 
        AND table_name = 'complaint_history'
        AND grantee = 'authenticated'
        AND privilege_type = 'INSERT'
    ) THEN 'PASS: SELECT and INSERT permissions found'
    ELSE 'FAIL: Missing SELECT or INSERT permissions'
  END AS required_permissions_check;

-- Count policies by command type
SELECT 
  cmd AS command,
  COUNT(*) AS policy_count
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'complaint_history'
GROUP BY cmd
ORDER BY cmd;


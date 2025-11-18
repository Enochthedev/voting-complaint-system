-- Check current database state

-- Check if user_role enum exists
SELECT 
  'user_role enum' as object,
  CASE WHEN EXISTS (SELECT FROM pg_type WHERE typname = 'user_role') 
    THEN 'EXISTS' ELSE 'NOT EXISTS' END as status;

-- Check if users table exists
SELECT 
  'users table' as object,
  CASE WHEN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN 'EXISTS' ELSE 'NOT EXISTS' END as status;

-- If users table exists, show its structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- Check triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'users';

-- Check RLS policies
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'users';

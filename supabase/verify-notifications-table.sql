-- Verification script for notifications table
-- Run this after applying the 011_create_notifications_table.sql migration

-- 1. Check if notifications table exists
SELECT 
  'notifications table exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'notifications'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 2. Check table columns
SELECT 
  'notifications table has all columns' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM information_schema.columns 
      WHERE table_name = 'notifications' 
      AND table_schema = 'public'
      AND column_name IN ('id', 'user_id', 'type', 'title', 'message', 'related_id', 'is_read', 'created_at')
    ) = 8 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 3. Check notification_type enum exists
SELECT 
  'notification_type enum exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_type 
      WHERE typname = 'notification_type'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 4. Check RLS is enabled
SELECT 
  'RLS enabled on notifications table' as check_name,
  CASE 
    WHEN (
      SELECT relrowsecurity 
      FROM pg_class 
      WHERE relname = 'notifications' 
      AND relnamespace = 'public'::regnamespace
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 5. Check RLS policies exist
SELECT 
  'RLS policies exist' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM pg_policies 
      WHERE tablename = 'notifications'
    ) >= 4 THEN '✓ PASS (4+ policies)'
    ELSE '✗ FAIL'
  END as status;

-- 6. Check foreign key constraint to users table
SELECT 
  'Foreign key to users table' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.notifications'::regclass
      AND contype = 'f'
      AND confrelid = 'public.users'::regclass
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 7. Check non-empty title constraint
SELECT 
  'Non-empty title constraint exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.notifications'::regclass
      AND contype = 'c'
      AND conname = 'non_empty_title'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 8. Check non-empty message constraint
SELECT 
  'Non-empty message constraint exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_constraint
      WHERE conrelid = 'public.notifications'::regclass
      AND contype = 'c'
      AND conname = 'non_empty_message'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 9. Check indexes exist
SELECT 
  'Indexes on notifications table' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM pg_indexes 
      WHERE tablename = 'notifications' 
      AND schemaname = 'public'
    ) >= 7 THEN '✓ PASS (7+ indexes)'
    ELSE '✗ FAIL'
  END as status;

-- 10. Check is_read default value
SELECT 
  'is_read has default FALSE' as check_name,
  CASE 
    WHEN (
      SELECT column_default 
      FROM information_schema.columns 
      WHERE table_name = 'notifications' 
      AND column_name = 'is_read'
    ) = 'false' THEN '✓ PASS'
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
WHERE table_name = 'notifications' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Summary: List notification_type enum values
SELECT 
  '--- Notification Type Enum Values ---' as info,
  '' as details
UNION ALL
SELECT 
  enumlabel::text as enum_value,
  '' as details
FROM pg_enum
WHERE enumtypid = 'notification_type'::regtype
ORDER BY enumsortorder;

-- Summary: List all indexes
SELECT 
  '--- Indexes ---' as info,
  '' as details
UNION ALL
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'notifications'
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
WHERE conrelid = 'public.notifications'::regclass
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
WHERE tablename = 'notifications'
ORDER BY policyname;

-- Final summary
SELECT 
  'notifications table verification complete' as status,
  COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND table_schema = 'public';

</content>
</invoke>
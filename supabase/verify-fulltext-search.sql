-- Verification script for full-text search GIN index
-- This script checks that the search_vector column and GIN index are properly configured

-- Check if search_vector column exists
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'complaints'
  AND column_name = 'search_vector';

-- Check if GIN index exists
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'complaints'
  AND indexname = 'idx_complaints_search_vector';

-- Check if trigger function exists
SELECT
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'update_complaint_search_vector';

-- Check if trigger exists
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'complaints'
  AND trigger_name = 'update_complaints_search_vector';

-- Test full-text search functionality (if there are any complaints)
-- This will return the count of complaints that can be searched
SELECT 
  COUNT(*) as total_complaints,
  COUNT(search_vector) as complaints_with_search_vector,
  CASE 
    WHEN COUNT(*) = COUNT(search_vector) THEN 'All complaints have search vectors'
    ELSE 'Some complaints missing search vectors'
  END as status
FROM public.complaints;

-- Example search query to verify GIN index is being used
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, title, description
FROM public.complaints
WHERE search_vector @@ to_tsquery('english', 'test')
LIMIT 10;

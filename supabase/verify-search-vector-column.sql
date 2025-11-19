-- Quick verification script for search_vector column
-- This script verifies that Task 1.4 sub-task "Add search_vector column" is complete

\echo '=== Verifying search_vector column exists ==='
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'complaints'
  AND column_name = 'search_vector';

\echo ''
\echo '=== Verification Result ==='
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'complaints'
        AND column_name = 'search_vector'
        AND data_type = 'tsvector'
    ) THEN '✅ PASSED: search_vector column exists with correct type (tsvector)'
    ELSE '❌ FAILED: search_vector column not found or incorrect type'
  END as verification_status;

\echo ''
\echo '=== Additional Information ==='
\echo 'Note: The search_vector column was added in migration 002_create_complaints_table.sql'
\echo 'Related components:'
\echo '  - Trigger function: update_complaint_search_vector()'
\echo '  - Trigger: update_complaints_search_vector'
\echo '  - GIN Index: idx_complaints_search_vector'
\echo ''
\echo 'To verify all full-text search components, run:'
\echo '  supabase db execute --file supabase/verify-fulltext-search.sql'

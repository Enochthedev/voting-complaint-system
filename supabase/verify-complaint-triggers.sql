-- Verification script for complaint triggers
-- This script checks that all triggers on the complaints table are properly created

\echo '========================================='
\echo 'Verifying Complaint Triggers'
\echo '========================================='
\echo ''

-- Check if trigger functions exist
\echo 'Checking trigger functions...'
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) IS NOT NULL as definition_exists
FROM pg_proc
WHERE proname IN (
  'log_complaint_status_change',
  'notify_student_on_status_change',
  'notify_lecturers_on_new_complaint',
  'log_complaint_creation',
  'log_complaint_assignment',
  'update_complaint_search_vector'
)
ORDER BY proname;

\echo ''
\echo 'Checking triggers on complaints table...'
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  CASE tgtype::integer & 1
    WHEN 1 THEN 'ROW'
    ELSE 'STATEMENT'
  END as level,
  CASE tgtype::integer & 66
    WHEN 2 THEN 'BEFORE'
    WHEN 64 THEN 'INSTEAD OF'
    ELSE 'AFTER'
  END as timing,
  CASE 
    WHEN tgtype::integer & 4 = 4 THEN 'INSERT'
    WHEN tgtype::integer & 8 = 8 THEN 'DELETE'
    WHEN tgtype::integer & 16 = 16 THEN 'UPDATE'
    ELSE 'UNKNOWN'
  END as event
FROM pg_trigger
WHERE tgrelid = 'public.complaints'::regclass
  AND tgisinternal = false
ORDER BY tgname;

\echo ''
\echo 'Expected triggers:'
\echo '  1. update_complaints_search_vector (BEFORE INSERT OR UPDATE)'
\echo '  2. update_complaints_updated_at (BEFORE UPDATE)'
\echo '  3. complaint_status_change_trigger (AFTER UPDATE)'
\echo '  4. notify_on_complaint_status_change (AFTER UPDATE)'
\echo '  5. notify_on_new_complaint (AFTER INSERT)'
\echo '  6. log_complaint_creation_trigger (AFTER INSERT)'
\echo '  7. log_complaint_assignment_trigger (AFTER UPDATE)'
\echo ''

-- Check trigger details
\echo 'Detailed trigger information...'
SELECT 
  t.tgname as trigger_name,
  p.proname as function_name,
  pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'public.complaints'::regclass
  AND t.tgisinternal = false
ORDER BY t.tgname;

\echo ''
\echo '========================================='
\echo 'Verification Complete'
\echo '========================================='

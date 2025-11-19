-- Verification script for composite indexes
-- Run this query to verify all composite indexes are created correctly

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE '%_complaint%' 
  AND (
    -- Composite indexes have multiple columns
    indexdef LIKE '%,%'
  )
ORDER BY tablename, indexname;

-- Expected composite indexes:
-- 
-- complaints table:
--   - idx_complaints_status_created_at (status, created_at DESC)
--   - idx_complaints_category_priority (category, priority)
--   - idx_complaints_assigned_status (assigned_to, status)
--
-- complaint_tags table:
--   - idx_complaint_tags_tag_complaint (tag_name, complaint_id)
--
-- complaint_attachments table:
--   - idx_complaint_attachments_complaint_created (complaint_id, created_at DESC)
--
-- complaint_history table:
--   - idx_complaint_history_complaint_created (complaint_id, created_at DESC)
--
-- complaint_comments table:
--   - idx_complaint_comments_complaint_created (complaint_id, created_at ASC)
--
-- complaint_ratings table:
--   - idx_complaint_ratings_created_rating (created_at DESC, rating)
--   - idx_complaint_ratings_student_created (student_id, created_at DESC)
--
-- complaint_templates table:
--   - idx_complaint_templates_active_category (is_active, category)
--
-- escalation_rules table:
--   - idx_escalation_rules_active_category_priority (is_active, category, priority)
--
-- feedback table:
--   - idx_feedback_complaint_created (complaint_id, created_at DESC)

-- Additional verification for other tables with composite indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    indexname LIKE 'idx_notifications_user%' OR
    indexname LIKE 'idx_votes_active%' OR
    indexname LIKE 'idx_vote_responses_vote%'
  )
  AND indexdef LIKE '%,%'
ORDER BY tablename, indexname;

-- Expected additional composite indexes:
--
-- notifications table:
--   - idx_notifications_user_unread (user_id, is_read, created_at DESC)
--   - idx_notifications_user_type (user_id, type, created_at DESC)
--
-- votes table:
--   - idx_votes_active_created (is_active, created_at DESC)
--
-- vote_responses table:
--   - idx_vote_responses_vote_option (vote_id, selected_option)

-- Count total composite indexes
SELECT 
  COUNT(*) as total_composite_indexes
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexdef LIKE '%,%';

-- Expected total: 15 composite indexes

-- Add indexes on foreign keys that are missing them
-- This migration ensures all foreign key columns have indexes for optimal join performance
-- Foreign keys without indexes can cause performance issues during joins and cascading operations

-- ============================================================================
-- FOREIGN KEY INDEX AUDIT SUMMARY
-- ============================================================================
-- This migration was created after a comprehensive audit of all foreign keys
-- in the database schema. The audit found that most foreign keys already have
-- indexes created in their respective table creation migrations.
--
-- FOREIGN KEYS WITH EXISTING INDEXES (created in table migrations):
-- - complaints.student_id (idx_complaints_student_id)
-- - complaints.assigned_to (idx_complaints_assigned_to)
-- - complaint_tags.complaint_id (idx_complaint_tags_complaint_id)
-- - complaint_attachments.complaint_id (idx_complaint_attachments_complaint_id)
-- - complaint_attachments.uploaded_by (idx_complaint_attachments_uploaded_by)
-- - complaint_history.complaint_id (idx_complaint_history_complaint_id)
-- - complaint_history.performed_by (idx_complaint_history_performed_by)
-- - complaint_comments.complaint_id (idx_complaint_comments_complaint_id)
-- - complaint_comments.user_id (idx_complaint_comments_user_id)
-- - complaint_ratings.complaint_id (idx_complaint_ratings_complaint_id)
-- - complaint_ratings.student_id (idx_complaint_ratings_student_id)
-- - complaint_templates.created_by (idx_complaint_templates_created_by)
-- - escalation_rules.escalate_to (idx_escalation_rules_escalate_to)
-- - feedback.complaint_id (idx_feedback_complaint_id)
-- - feedback.lecturer_id (idx_feedback_lecturer_id)
-- - notifications.user_id (idx_notifications_user_id)
-- - notifications.related_id (idx_notifications_related_id)
-- - votes.created_by (idx_votes_created_by)
-- - votes.related_complaint_id (idx_votes_related_complaint_id)
-- - vote_responses.vote_id (idx_vote_responses_vote_id)
-- - vote_responses.student_id (idx_vote_responses_student_id)
-- - announcements.created_by (idx_announcements_created_by)
--
-- FOREIGN KEYS NEEDING INDEXES (added in this migration):
-- - complaints.opened_by (idx_complaints_opened_by)
-- ============================================================================

-- Add index on complaints.opened_by foreign key
-- This foreign key references users(id) and tracks who first opened a complaint
-- Index improves performance when querying complaints by who opened them
CREATE INDEX IF NOT EXISTS idx_complaints_opened_by 
  ON public.complaints(opened_by);

-- Comments for documentation
COMMENT ON INDEX idx_complaints_opened_by IS 
  'Index on foreign key complaints.opened_by for improved join performance and queries filtering by who opened complaints';

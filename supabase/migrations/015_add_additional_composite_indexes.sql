-- Add additional composite indexes for common query patterns
-- This migration adds composite indexes to tables that didn't have them yet
-- to optimize common query patterns and improve performance

-- Composite index for complaint_attachments
-- Useful for retrieving attachments for a complaint in chronological order
CREATE INDEX IF NOT EXISTS idx_complaint_attachments_complaint_created 
  ON public.complaint_attachments(complaint_id, created_at DESC);

-- Composite index for complaint_ratings
-- Useful for time-based analytics queries (e.g., average rating over time)
CREATE INDEX IF NOT EXISTS idx_complaint_ratings_created_rating 
  ON public.complaint_ratings(created_at DESC, rating);

-- Composite index for complaint_ratings by student
-- Useful for retrieving a student's rating history
CREATE INDEX IF NOT EXISTS idx_complaint_ratings_student_created 
  ON public.complaint_ratings(student_id, created_at DESC);

-- Comments for documentation
COMMENT ON INDEX idx_complaint_attachments_complaint_created IS 
  'Composite index for retrieving attachments for a complaint in chronological order';

COMMENT ON INDEX idx_complaint_ratings_created_rating IS 
  'Composite index for time-based analytics queries on ratings';

COMMENT ON INDEX idx_complaint_ratings_student_created IS 
  'Composite index for retrieving a student''s rating history';

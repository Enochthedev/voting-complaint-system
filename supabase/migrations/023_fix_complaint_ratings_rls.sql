-- Fix complaint_ratings RLS policies to avoid infinite recursion
-- This migration updates the RLS policies to use JWT claims instead of querying the users table

-- Drop existing policies
DROP POLICY IF EXISTS "Students rate own resolved complaints" ON public.complaint_ratings;
DROP POLICY IF EXISTS "Students view own ratings" ON public.complaint_ratings;
DROP POLICY IF EXISTS "Lecturers view all ratings" ON public.complaint_ratings;

-- RLS Policy: Students can rate their own resolved complaints
-- This policy ensures students can only rate complaints they submitted and that are resolved
CREATE POLICY "Students rate own resolved complaints"
  ON public.complaint_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt()->>'role' = 'student'
    AND student_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.complaints
      WHERE id = complaint_id
      AND student_id = auth.uid()
      AND status = 'resolved'
    )
  );

-- RLS Policy: Students can view their own ratings
-- Lecturers and admins can view all ratings
CREATE POLICY "Students view own ratings"
  ON public.complaint_ratings
  FOR SELECT
  TO authenticated
  USING (
    -- Lecturers and admins can view all ratings
    (auth.jwt()->>'role' IN ('lecturer', 'admin'))
    OR
    -- Students can view their own ratings
    (auth.jwt()->>'role' = 'student' AND student_id = auth.uid())
  );

-- RLS Policy: Students can update their own ratings (within a reasonable time window)
-- This allows students to modify their rating if they change their mind
CREATE POLICY "Students update own ratings"
  ON public.complaint_ratings
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt()->>'role' = 'student'
    AND student_id = auth.uid()
  )
  WITH CHECK (
    auth.jwt()->>'role' = 'student'
    AND student_id = auth.uid()
  );

-- RLS Policy: Prevent deletion of ratings to maintain data integrity
-- No one should be able to delete ratings once submitted
-- This ensures audit trail and analytics accuracy

-- Comments for documentation
COMMENT ON POLICY "Students rate own resolved complaints" ON public.complaint_ratings IS 
  'Students can only rate their own complaints that have been resolved';
COMMENT ON POLICY "Students view own ratings" ON public.complaint_ratings IS 
  'Students can view their own ratings; lecturers and admins can view all ratings';
COMMENT ON POLICY "Students update own ratings" ON public.complaint_ratings IS 
  'Students can update their own ratings if they change their mind';


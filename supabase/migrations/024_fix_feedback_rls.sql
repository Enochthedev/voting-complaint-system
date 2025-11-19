-- Fix feedback RLS policies to avoid infinite recursion
-- This migration updates the RLS policies to use JWT claims instead of querying the users table

-- Drop existing policies
DROP POLICY IF EXISTS "Students view feedback" ON public.feedback;
DROP POLICY IF EXISTS "Lecturers insert feedback" ON public.feedback;
DROP POLICY IF EXISTS "Lecturers update own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Lecturers delete own feedback" ON public.feedback;

-- RLS Policy: Students can view feedback on their complaints
-- Lecturers and admins can view all feedback
CREATE POLICY "Students view feedback"
  ON public.feedback
  FOR SELECT
  TO authenticated
  USING (
    -- Lecturers and admins can view all feedback
    (auth.jwt()->>'role' IN ('lecturer', 'admin'))
    OR
    -- Students can view feedback on their own complaints
    (
      complaint_id IN (
        SELECT id FROM public.complaints
        WHERE student_id = auth.uid()
      )
    )
  );

-- RLS Policy: Lecturers can insert feedback
CREATE POLICY "Lecturers insert feedback"
  ON public.feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt()->>'role' IN ('lecturer', 'admin')
    AND lecturer_id = auth.uid()
  );

-- RLS Policy: Lecturers can update their own feedback
CREATE POLICY "Lecturers update own feedback"
  ON public.feedback
  FOR UPDATE
  TO authenticated
  USING (
    lecturer_id = auth.uid()
    AND auth.jwt()->>'role' IN ('lecturer', 'admin')
  )
  WITH CHECK (
    lecturer_id = auth.uid()
    AND auth.jwt()->>'role' IN ('lecturer', 'admin')
  );

-- RLS Policy: Lecturers can delete their own feedback
CREATE POLICY "Lecturers delete own feedback"
  ON public.feedback
  FOR DELETE
  TO authenticated
  USING (
    lecturer_id = auth.uid()
    AND auth.jwt()->>'role' IN ('lecturer', 'admin')
  );

-- Comments for documentation
COMMENT ON POLICY "Students view feedback" ON public.feedback IS 
  'Students can view feedback on their complaints; lecturers can view all feedback';
COMMENT ON POLICY "Lecturers insert feedback" ON public.feedback IS 
  'Lecturers and admins can insert feedback on any complaint';
COMMENT ON POLICY "Lecturers update own feedback" ON public.feedback IS 
  'Lecturers can update their own feedback';
COMMENT ON POLICY "Lecturers delete own feedback" ON public.feedback IS 
  'Lecturers can delete their own feedback';

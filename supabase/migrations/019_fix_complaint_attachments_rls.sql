-- Fix complaint_attachments RLS policies to avoid infinite recursion
-- This migration updates the RLS policies to use JWT claims instead of querying the users table

-- Drop existing policies
DROP POLICY IF EXISTS "Users view attachments on accessible complaints" ON public.complaint_attachments;
DROP POLICY IF EXISTS "Students upload attachments to own complaints" ON public.complaint_attachments;
DROP POLICY IF EXISTS "Lecturers upload attachments to complaints" ON public.complaint_attachments;
DROP POLICY IF EXISTS "Students delete attachments from own complaints" ON public.complaint_attachments;
DROP POLICY IF EXISTS "Lecturers delete attachments from complaints" ON public.complaint_attachments;

-- RLS Policy: Users can view attachments on accessible complaints
-- Students can view attachments on their own complaints
-- Lecturers and admins can view attachments on all complaints
CREATE POLICY "Users view attachments on accessible complaints"
  ON public.complaint_attachments
  FOR SELECT
  TO authenticated
  USING (
    -- Lecturers and admins can view all attachments
    (auth.jwt()->>'role' IN ('lecturer', 'admin'))
    OR
    -- Students can view attachments on their own complaints
    (
      auth.jwt()->>'role' = 'student'
      AND complaint_id IN (
        SELECT id FROM public.complaints
        WHERE student_id = auth.uid()
      )
    )
  );

-- RLS Policy: Students can upload attachments to their own complaints
CREATE POLICY "Students upload attachments to own complaints"
  ON public.complaint_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt()->>'role' = 'student'
    AND complaint_id IN (
      SELECT id FROM public.complaints
      WHERE student_id = auth.uid()
    )
    AND uploaded_by = auth.uid()
  );

-- RLS Policy: Lecturers and admins can upload attachments to any complaint
CREATE POLICY "Lecturers upload attachments to complaints"
  ON public.complaint_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt()->>'role' IN ('lecturer', 'admin')
    AND uploaded_by = auth.uid()
  );

-- RLS Policy: Students can delete attachments from their own complaints
CREATE POLICY "Students delete attachments from own complaints"
  ON public.complaint_attachments
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt()->>'role' = 'student'
    AND complaint_id IN (
      SELECT id FROM public.complaints
      WHERE student_id = auth.uid()
    )
  );

-- RLS Policy: Lecturers and admins can delete attachments from any complaint
CREATE POLICY "Lecturers delete attachments from complaints"
  ON public.complaint_attachments
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt()->>'role' IN ('lecturer', 'admin')
  );

-- Comment for documentation
COMMENT ON POLICY "Users view attachments on accessible complaints" ON public.complaint_attachments IS 
  'Students can view attachments on their own complaints; Lecturers and admins can view all attachments';
COMMENT ON POLICY "Students upload attachments to own complaints" ON public.complaint_attachments IS 
  'Students can only upload attachments to their own complaints';
COMMENT ON POLICY "Lecturers upload attachments to complaints" ON public.complaint_attachments IS 
  'Lecturers and admins can upload attachments to any complaint';
COMMENT ON POLICY "Students delete attachments from own complaints" ON public.complaint_attachments IS 
  'Students can only delete attachments from their own complaints';
COMMENT ON POLICY "Lecturers delete attachments from complaints" ON public.complaint_attachments IS 
  'Lecturers and admins can delete attachments from any complaint';

-- Fix complaint_comments RLS policies to avoid infinite recursion
-- This migration updates the RLS policies to use JWT claims instead of querying the users table

-- Drop existing policies
DROP POLICY IF EXISTS "View comments on accessible complaints" ON public.complaint_comments;
DROP POLICY IF EXISTS "Add comments to accessible complaints" ON public.complaint_comments;
DROP POLICY IF EXISTS "Users update own comments" ON public.complaint_comments;
DROP POLICY IF EXISTS "Users delete own comments" ON public.complaint_comments;
DROP POLICY IF EXISTS "Lecturers delete any comment" ON public.complaint_comments;

-- RLS Policy: View comments on accessible complaints (hide internal notes from students)
-- Students can view non-internal comments on their own complaints
-- Lecturers can view all comments on all complaints
CREATE POLICY "View comments on accessible complaints"
  ON public.complaint_comments
  FOR SELECT
  TO authenticated
  USING (
    -- Lecturers and admins can view all comments
    (auth.jwt()->>'role' IN ('lecturer', 'admin'))
    OR
    -- Students can view non-internal comments on their own complaints
    (
      is_internal = false
      AND complaint_id IN (
        SELECT id FROM public.complaints
        WHERE student_id = auth.uid()
      )
    )
  );

-- RLS Policy: Add comments to accessible complaints
-- Students can add comments to their own complaints
-- Lecturers can add comments to any complaint
CREATE POLICY "Add comments to accessible complaints"
  ON public.complaint_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User must be the comment author
    user_id = auth.uid()
    AND
    (
      -- Lecturers and admins can comment on any complaint
      auth.jwt()->>'role' IN ('lecturer', 'admin')
      OR
      -- Students can comment on their own complaints
      complaint_id IN (
        SELECT id FROM public.complaints
        WHERE student_id = auth.uid()
      )
    )
  );

-- RLS Policy: Users can update their own comments
CREATE POLICY "Users update own comments"
  ON public.complaint_comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: Users can delete their own comments
CREATE POLICY "Users delete own comments"
  ON public.complaint_comments
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policy: Lecturers and admins can delete any comment
CREATE POLICY "Lecturers delete any comment"
  ON public.complaint_comments
  FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'role' IN ('lecturer', 'admin'));

-- Comments for documentation
COMMENT ON POLICY "View comments on accessible complaints" ON public.complaint_comments IS 
  'Students can view non-internal comments on their complaints; lecturers can view all comments';
COMMENT ON POLICY "Add comments to accessible complaints" ON public.complaint_comments IS 
  'Students can comment on their own complaints; lecturers can comment on any complaint';
COMMENT ON POLICY "Users update own comments" ON public.complaint_comments IS 
  'Users can update their own comments';
COMMENT ON POLICY "Users delete own comments" ON public.complaint_comments IS 
  'Users can delete their own comments';
COMMENT ON POLICY "Lecturers delete any comment" ON public.complaint_comments IS 
  'Lecturers and admins can delete any comment';

-- Fix votes and vote_responses RLS policies to avoid infinite recursion
-- The issue is that the policies check the users table, which itself has RLS policies
-- This creates a circular dependency

-- Drop existing policies on votes table
DROP POLICY IF EXISTS "Lecturers create votes" ON public.votes;
DROP POLICY IF EXISTS "Lecturers update own votes" ON public.votes;
DROP POLICY IF EXISTS "Lecturers delete own votes" ON public.votes;

-- Recreate INSERT policy without users table lookup
-- Instead, we'll rely on application-level validation or use a security definer function
CREATE POLICY "Lecturers create votes"
  ON public.votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
  );

-- Recreate UPDATE policy
CREATE POLICY "Lecturers update own votes"
  ON public.votes
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Recreate DELETE policy
CREATE POLICY "Lecturers delete own votes"
  ON public.votes
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Drop existing policies on vote_responses table
DROP POLICY IF EXISTS "Students view own responses" ON public.vote_responses;
DROP POLICY IF EXISTS "Students insert responses" ON public.vote_responses;

-- Recreate SELECT policy to avoid recursion
CREATE POLICY "Students view own responses"
  ON public.vote_responses
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Add policy for lecturers to view all responses
CREATE POLICY "Lecturers view all responses"
  ON public.vote_responses
  FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.votes
      WHERE votes.id = vote_responses.vote_id
      AND votes.created_by = auth.uid()
    )
  );

-- Recreate INSERT policy
CREATE POLICY "Students insert responses"
  ON public.vote_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Comments
COMMENT ON POLICY "Lecturers create votes" ON public.votes IS 'Lecturers can create votes - role validation done at application level';
COMMENT ON POLICY "Lecturers view all responses" ON public.vote_responses IS 'Lecturers can view responses to their own votes';


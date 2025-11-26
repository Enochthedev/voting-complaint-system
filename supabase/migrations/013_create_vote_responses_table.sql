-- Create vote_responses table
-- This table stores individual student responses to voting polls
-- 
-- IMPORTANT: Enforces one vote per student per poll through UNIQUE constraint
-- The constraint 'unique_vote_per_student' on (vote_id, student_id) ensures
-- that each student can only vote once per poll. Any attempt to insert a
-- duplicate will fail with error code 23505.
--
-- This satisfies:
-- - Acceptance Criteria AC6: "Students can only vote once per poll"
-- - Design Property P6: "Vote Uniqueness"

-- Create vote_responses table
CREATE TABLE IF NOT EXISTS public.vote_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID NOT NULL REFERENCES public.votes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  selected_option TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: selected_option cannot be empty
  CONSTRAINT non_empty_selected_option CHECK (LENGTH(TRIM(selected_option)) > 0),
  
  -- Constraint: one vote per student per poll
  CONSTRAINT unique_vote_per_student UNIQUE (vote_id, student_id)
);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_vote_responses_vote_id ON public.vote_responses(vote_id);
CREATE INDEX IF NOT EXISTS idx_vote_responses_student_id ON public.vote_responses(student_id);
CREATE INDEX IF NOT EXISTS idx_vote_responses_created_at ON public.vote_responses(created_at DESC);

-- Create composite index for vote results aggregation
CREATE INDEX IF NOT EXISTS idx_vote_responses_vote_option ON public.vote_responses(vote_id, selected_option);

-- Enable Row Level Security
ALTER TABLE public.vote_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Students can view their own responses
-- Lecturers and admins can view all responses
CREATE POLICY "Students view own responses"
  ON public.vote_responses
  FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  );

-- RLS Policy: Students can insert their own responses
CREATE POLICY "Students insert responses"
  ON public.vote_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'student'
    )
  );

-- RLS Policy: Students can update their own responses (change vote)
CREATE POLICY "Students update own responses"
  ON public.vote_responses
  FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- RLS Policy: Students can delete their own responses
CREATE POLICY "Students delete own responses"
  ON public.vote_responses
  FOR DELETE
  TO authenticated
  USING (student_id = auth.uid());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.vote_responses TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.vote_responses IS 'Student responses to voting polls with one vote per student per poll enforcement';
COMMENT ON COLUMN public.vote_responses.id IS 'Unique identifier for the vote response';
COMMENT ON COLUMN public.vote_responses.vote_id IS 'Reference to the vote being responded to';
COMMENT ON COLUMN public.vote_responses.student_id IS 'Student who cast this vote';
COMMENT ON COLUMN public.vote_responses.selected_option IS 'The option selected by the student';
COMMENT ON COLUMN public.vote_responses.created_at IS 'Timestamp when the vote was cast';

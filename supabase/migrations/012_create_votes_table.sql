-- Create votes table
-- This table stores voting polls created by lecturers/admins
-- Students can vote on these polls to provide feedback on topics

-- Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  related_complaint_id UUID REFERENCES public.complaints(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closes_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraint: title cannot be empty
  CONSTRAINT non_empty_title CHECK (LENGTH(TRIM(title)) > 0),
  
  -- Constraint: options must be a non-empty array
  CONSTRAINT non_empty_options CHECK (jsonb_array_length(options) > 0),
  
  -- Constraint: closes_at must be in the future when set
  CONSTRAINT future_closes_at CHECK (closes_at IS NULL OR closes_at > created_at)
);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_votes_created_by ON public.votes(created_by);
CREATE INDEX IF NOT EXISTS idx_votes_is_active ON public.votes(is_active);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON public.votes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_closes_at ON public.votes(closes_at);
CREATE INDEX IF NOT EXISTS idx_votes_related_complaint_id ON public.votes(related_complaint_id);

-- Create composite index for active votes
CREATE INDEX IF NOT EXISTS idx_votes_active_created ON public.votes(is_active, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can view votes
CREATE POLICY "All users view votes"
  ON public.votes
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy: Lecturers and admins can create votes
CREATE POLICY "Lecturers create votes"
  ON public.votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  );

-- RLS Policy: Lecturers and admins can update their own votes
CREATE POLICY "Lecturers update own votes"
  ON public.votes
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  )
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  );

-- RLS Policy: Lecturers and admins can delete their own votes
CREATE POLICY "Lecturers delete own votes"
  ON public.votes
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.votes TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.votes IS 'Voting polls created by lecturers/admins for student feedback';
COMMENT ON COLUMN public.votes.id IS 'Unique identifier for the vote';
COMMENT ON COLUMN public.votes.created_by IS 'Lecturer or admin who created the vote';
COMMENT ON COLUMN public.votes.title IS 'Title of the voting poll';
COMMENT ON COLUMN public.votes.description IS 'Optional description providing context for the vote';
COMMENT ON COLUMN public.votes.options IS 'JSON array of voting options';
COMMENT ON COLUMN public.votes.is_active IS 'Whether the vote is currently active and accepting responses';
COMMENT ON COLUMN public.votes.related_complaint_id IS 'Optional reference to a related complaint';
COMMENT ON COLUMN public.votes.created_at IS 'Timestamp when the vote was created';
COMMENT ON COLUMN public.votes.closes_at IS 'Optional timestamp when the vote closes';

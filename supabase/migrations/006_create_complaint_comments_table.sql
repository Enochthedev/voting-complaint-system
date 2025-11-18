-- Create complaint_comments table
-- This table stores comments and discussion threads on complaints
-- Supports both public comments and internal lecturer-only notes

-- Create complaint_comments table
CREATE TABLE IF NOT EXISTS public.complaint_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  comment TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: comment cannot be empty
  CONSTRAINT non_empty_comment CHECK (LENGTH(TRIM(comment)) > 0)
);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_complaint_comments_complaint_id ON public.complaint_comments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_comments_user_id ON public.complaint_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_complaint_comments_created_at ON public.complaint_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaint_comments_is_internal ON public.complaint_comments(is_internal);

-- Create composite index for common query patterns (complaint discussion thread)
CREATE INDEX IF NOT EXISTS idx_complaint_comments_complaint_created ON public.complaint_comments(complaint_id, created_at ASC);

-- Function to update updated_at timestamp
CREATE TRIGGER update_complaint_comments_updated_at
  BEFORE UPDATE ON public.complaint_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.complaint_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: View comments on accessible complaints (hide internal notes from students)
CREATE POLICY "View comments on accessible complaints"
  ON public.complaint_comments
  FOR SELECT
  TO authenticated
  USING (
    complaint_id IN (
      SELECT id FROM public.complaints
      WHERE student_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role IN ('lecturer', 'admin')
      )
    ) AND (
      is_internal = false OR
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role IN ('lecturer', 'admin')
      )
    )
  );

-- RLS Policy: Add comments to accessible complaints
CREATE POLICY "Add comments to accessible complaints"
  ON public.complaint_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    complaint_id IN (
      SELECT id FROM public.complaints
      WHERE student_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role IN ('lecturer', 'admin')
      )
    ) AND user_id = auth.uid()
  );

-- RLS Policy: Users can update their own comments (within reasonable time)
CREATE POLICY "Users update own comments"
  ON public.complaint_comments
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
  )
  WITH CHECK (
    user_id = auth.uid()
  );

-- RLS Policy: Users can delete their own comments
CREATE POLICY "Users delete own comments"
  ON public.complaint_comments
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
  );

-- RLS Policy: Lecturers and admins can delete any comment
CREATE POLICY "Lecturers delete any comment"
  ON public.complaint_comments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.complaint_comments TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.complaint_comments IS 'Comments and discussion threads on complaints, including internal lecturer notes';
COMMENT ON COLUMN public.complaint_comments.id IS 'Unique identifier for the comment';
COMMENT ON COLUMN public.complaint_comments.complaint_id IS 'References the complaint this comment belongs to';
COMMENT ON COLUMN public.complaint_comments.user_id IS 'User who wrote the comment';
COMMENT ON COLUMN public.complaint_comments.comment IS 'The comment text content';
COMMENT ON COLUMN public.complaint_comments.is_internal IS 'Whether this is an internal note visible only to lecturers/admins';
COMMENT ON COLUMN public.complaint_comments.created_at IS 'Timestamp when the comment was created';
COMMENT ON COLUMN public.complaint_comments.updated_at IS 'Timestamp when the comment was last updated';

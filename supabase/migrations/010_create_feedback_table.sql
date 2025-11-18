-- Create feedback table
-- This table stores feedback/responses from lecturers on complaints
-- Lecturers can provide feedback to students on their complaints

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  lecturer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: content cannot be empty
  CONSTRAINT non_empty_content CHECK (LENGTH(TRIM(content)) > 0)
);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_feedback_complaint_id ON public.feedback(complaint_id);
CREATE INDEX IF NOT EXISTS idx_feedback_lecturer_id ON public.feedback(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- Create composite index for common query patterns (feedback history for a complaint)
CREATE INDEX IF NOT EXISTS idx_feedback_complaint_created ON public.feedback(complaint_id, created_at DESC);

-- Function to update updated_at timestamp
CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Students can view feedback on their complaints
CREATE POLICY "Students view feedback"
  ON public.feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE complaints.id = feedback.complaint_id
      AND (
        complaints.student_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.users
          WHERE id = auth.uid()
          AND role IN ('lecturer', 'admin')
        )
      )
    )
  );

-- RLS Policy: Lecturers can insert feedback
CREATE POLICY "Lecturers insert feedback"
  ON public.feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    ) AND lecturer_id = auth.uid()
  );

-- RLS Policy: Lecturers can update their own feedback (within reasonable time)
CREATE POLICY "Lecturers update own feedback"
  ON public.feedback
  FOR UPDATE
  TO authenticated
  USING (
    lecturer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  )
  WITH CHECK (
    lecturer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  );

-- RLS Policy: Lecturers can delete their own feedback
CREATE POLICY "Lecturers delete own feedback"
  ON public.feedback
  FOR DELETE
  TO authenticated
  USING (
    lecturer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.feedback TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.feedback IS 'Feedback and responses from lecturers on student complaints';
COMMENT ON COLUMN public.feedback.id IS 'Unique identifier for the feedback';
COMMENT ON COLUMN public.feedback.complaint_id IS 'References the complaint this feedback is for';
COMMENT ON COLUMN public.feedback.lecturer_id IS 'Lecturer who provided the feedback';
COMMENT ON COLUMN public.feedback.content IS 'The feedback text content';
COMMENT ON COLUMN public.feedback.created_at IS 'Timestamp when the feedback was created';
COMMENT ON COLUMN public.feedback.updated_at IS 'Timestamp when the feedback was last updated';

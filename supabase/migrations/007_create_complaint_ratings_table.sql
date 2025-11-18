-- Create complaint_ratings table
-- This table stores satisfaction ratings from students after complaint resolution

-- Create complaint_ratings table
CREATE TABLE IF NOT EXISTS public.complaint_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: ensure one rating per complaint
  CONSTRAINT unique_complaint_rating UNIQUE(complaint_id),
  
  -- Constraint: rating must be between 1 and 5
  CONSTRAINT rating_range_check CHECK (rating >= 1 AND rating <= 5)
);

-- Create index on complaint_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_complaint_ratings_complaint_id ON public.complaint_ratings(complaint_id);

-- Create index on student_id for user-specific queries
CREATE INDEX IF NOT EXISTS idx_complaint_ratings_student_id ON public.complaint_ratings(student_id);

-- Create index on rating for analytics queries
CREATE INDEX IF NOT EXISTS idx_complaint_ratings_rating ON public.complaint_ratings(rating);

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_complaint_ratings_created_at ON public.complaint_ratings(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.complaint_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Students can rate their own resolved complaints
CREATE POLICY "Students rate own resolved complaints"
  ON public.complaint_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE id = complaint_id
      AND student_id = auth.uid()
      AND status = 'resolved'
    )
  );

-- RLS Policy: Students can view their own ratings
CREATE POLICY "Students view own ratings"
  ON public.complaint_ratings
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

-- RLS Policy: Lecturers and admins can view all ratings
CREATE POLICY "Lecturers view all ratings"
  ON public.complaint_ratings
  FOR SELECT
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
GRANT ALL ON public.complaint_ratings TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.complaint_ratings IS 'Satisfaction ratings from students after complaint resolution';
COMMENT ON COLUMN public.complaint_ratings.id IS 'Unique identifier for the rating';
COMMENT ON COLUMN public.complaint_ratings.complaint_id IS 'References the complaint being rated';
COMMENT ON COLUMN public.complaint_ratings.student_id IS 'References the student who provided the rating';
COMMENT ON COLUMN public.complaint_ratings.rating IS 'Rating value from 1 to 5 stars';
COMMENT ON COLUMN public.complaint_ratings.feedback_text IS 'Optional text feedback on resolution quality';
COMMENT ON COLUMN public.complaint_ratings.created_at IS 'Timestamp when the rating was submitted';

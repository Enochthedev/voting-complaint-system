-- Create complaint_tags table
-- This table stores tags associated with complaints for better categorization and filtering

-- Create complaint_tags table
CREATE TABLE IF NOT EXISTS public.complaint_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: ensure unique tag per complaint
  CONSTRAINT unique_complaint_tag UNIQUE(complaint_id, tag_name)
);

-- Create index on complaint_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_complaint_tags_complaint_id ON public.complaint_tags(complaint_id);

-- Create index on tag_name for filtering and searching
CREATE INDEX IF NOT EXISTS idx_complaint_tags_tag_name ON public.complaint_tags(tag_name);

-- Create composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_complaint_tags_tag_complaint ON public.complaint_tags(tag_name, complaint_id);

-- Enable Row Level Security
ALTER TABLE public.complaint_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view tags on accessible complaints
CREATE POLICY "Users view tags on accessible complaints"
  ON public.complaint_tags
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
    )
  );

-- RLS Policy: Students can add tags to their own complaints
CREATE POLICY "Students add tags to own complaints"
  ON public.complaint_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (
    complaint_id IN (
      SELECT id FROM public.complaints
      WHERE student_id = auth.uid()
    )
  );

-- RLS Policy: Lecturers and admins can add tags to any complaint
CREATE POLICY "Lecturers add tags to complaints"
  ON public.complaint_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  );

-- RLS Policy: Students can delete tags from their own complaints
CREATE POLICY "Students delete tags from own complaints"
  ON public.complaint_tags
  FOR DELETE
  TO authenticated
  USING (
    complaint_id IN (
      SELECT id FROM public.complaints
      WHERE student_id = auth.uid()
    )
  );

-- RLS Policy: Lecturers and admins can delete tags from any complaint
CREATE POLICY "Lecturers delete tags from complaints"
  ON public.complaint_tags
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
GRANT ALL ON public.complaint_tags TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.complaint_tags IS 'Tags associated with complaints for categorization and filtering';
COMMENT ON COLUMN public.complaint_tags.id IS 'Unique identifier for the tag entry';
COMMENT ON COLUMN public.complaint_tags.complaint_id IS 'References the complaint this tag belongs to';
COMMENT ON COLUMN public.complaint_tags.tag_name IS 'The tag name/label';
COMMENT ON COLUMN public.complaint_tags.created_at IS 'Timestamp when the tag was added';

-- Create announcements table
-- This table stores system-wide announcements created by lecturers/admins
-- All students can view announcements

-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: title cannot be empty
  CONSTRAINT non_empty_title CHECK (LENGTH(TRIM(title)) > 0),
  
  -- Constraint: content cannot be empty
  CONSTRAINT non_empty_content CHECK (LENGTH(TRIM(content)) > 0)
);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON public.announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_updated_at ON public.announcements(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can view announcements
CREATE POLICY "All users view announcements"
  ON public.announcements
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy: Lecturers and admins can create announcements
CREATE POLICY "Lecturers create announcements"
  ON public.announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  );

-- RLS Policy: Lecturers and admins can update their own announcements
CREATE POLICY "Lecturers update own announcements"
  ON public.announcements
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

-- RLS Policy: Lecturers and admins can delete their own announcements
CREATE POLICY "Lecturers delete own announcements"
  ON public.announcements
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
GRANT ALL ON public.announcements TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.announcements IS 'System-wide announcements created by lecturers/admins visible to all students';
COMMENT ON COLUMN public.announcements.id IS 'Unique identifier for the announcement';
COMMENT ON COLUMN public.announcements.created_by IS 'Lecturer or admin who created the announcement';
COMMENT ON COLUMN public.announcements.title IS 'Title of the announcement';
COMMENT ON COLUMN public.announcements.content IS 'Content/body of the announcement';
COMMENT ON COLUMN public.announcements.created_at IS 'Timestamp when the announcement was created';
COMMENT ON COLUMN public.announcements.updated_at IS 'Timestamp when the announcement was last updated';

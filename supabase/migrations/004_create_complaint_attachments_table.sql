-- Create complaint_attachments table
-- This table stores metadata for files attached to complaints

-- Create complaint_attachments table
CREATE TABLE IF NOT EXISTS public.complaint_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: file size must be positive
  CONSTRAINT positive_file_size CHECK (file_size > 0),
  
  -- Constraint: file size limit (10MB = 10485760 bytes)
  CONSTRAINT file_size_limit CHECK (file_size <= 10485760)
);

-- Create index on complaint_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_complaint_attachments_complaint_id ON public.complaint_attachments(complaint_id);

-- Create index on uploaded_by for tracking who uploaded files
CREATE INDEX IF NOT EXISTS idx_complaint_attachments_uploaded_by ON public.complaint_attachments(uploaded_by);

-- Create index on created_at for sorting by upload time
CREATE INDEX IF NOT EXISTS idx_complaint_attachments_created_at ON public.complaint_attachments(created_at DESC);

-- Create index on file_type for filtering by file type
CREATE INDEX IF NOT EXISTS idx_complaint_attachments_file_type ON public.complaint_attachments(file_type);

-- Enable Row Level Security
ALTER TABLE public.complaint_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view attachments on accessible complaints
CREATE POLICY "Users view attachments on accessible complaints"
  ON public.complaint_attachments
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

-- RLS Policy: Students can upload attachments to their own complaints
CREATE POLICY "Students upload attachments to own complaints"
  ON public.complaint_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    complaint_id IN (
      SELECT id FROM public.complaints
      WHERE student_id = auth.uid()
    ) AND uploaded_by = auth.uid()
  );

-- RLS Policy: Lecturers and admins can upload attachments to any complaint
CREATE POLICY "Lecturers upload attachments to complaints"
  ON public.complaint_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    ) AND uploaded_by = auth.uid()
  );

-- RLS Policy: Students can delete attachments from their own complaints
CREATE POLICY "Students delete attachments from own complaints"
  ON public.complaint_attachments
  FOR DELETE
  TO authenticated
  USING (
    complaint_id IN (
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
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.complaint_attachments TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.complaint_attachments IS 'Metadata for files attached to complaints stored in Supabase Storage';
COMMENT ON COLUMN public.complaint_attachments.id IS 'Unique identifier for the attachment record';
COMMENT ON COLUMN public.complaint_attachments.complaint_id IS 'References the complaint this attachment belongs to';
COMMENT ON COLUMN public.complaint_attachments.file_name IS 'Original name of the uploaded file';
COMMENT ON COLUMN public.complaint_attachments.file_path IS 'Path to the file in Supabase Storage';
COMMENT ON COLUMN public.complaint_attachments.file_size IS 'Size of the file in bytes';
COMMENT ON COLUMN public.complaint_attachments.file_type IS 'MIME type of the file';
COMMENT ON COLUMN public.complaint_attachments.uploaded_by IS 'User who uploaded the file';
COMMENT ON COLUMN public.complaint_attachments.created_at IS 'Timestamp when the file was uploaded';

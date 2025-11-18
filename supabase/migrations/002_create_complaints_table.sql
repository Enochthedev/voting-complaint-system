-- Create complaints table with all fields
-- This table stores all student complaints with comprehensive tracking

-- Create enum for complaint categories
DO $$ BEGIN
  CREATE TYPE complaint_category AS ENUM (
    'academic',
    'facilities',
    'harassment',
    'course_content',
    'administrative',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for complaint priorities
DO $$ BEGIN
  CREATE TYPE complaint_priority AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for complaint statuses
DO $$ BEGIN
  CREATE TYPE complaint_status AS ENUM (
    'draft',
    'new',
    'opened',
    'in_progress',
    'resolved',
    'closed',
    'reopened'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create complaints table
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  is_draft BOOLEAN NOT NULL DEFAULT false,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category complaint_category NOT NULL,
  priority complaint_priority NOT NULL DEFAULT 'medium',
  status complaint_status NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  opened_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  escalated_at TIMESTAMP WITH TIME ZONE,
  escalation_level INTEGER DEFAULT 0,
  search_vector tsvector,
  
  -- Constraint: anonymous complaints must have null student_id
  CONSTRAINT anonymous_complaint_check CHECK (
    (is_anonymous = true AND student_id IS NULL) OR
    (is_anonymous = false)
  ),
  
  -- Constraint: draft complaints must have status 'draft'
  CONSTRAINT draft_status_check CHECK (
    (is_draft = true AND status = 'draft') OR
    (is_draft = false AND status != 'draft')
  )
);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_complaints_student_id ON public.complaints(student_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON public.complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to ON public.complaints(assigned_to);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_updated_at ON public.complaints(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_is_draft ON public.complaints(is_draft);

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_complaints_status_created_at ON public.complaints(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_category_priority ON public.complaints(category, priority);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_status ON public.complaints(assigned_to, status);

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_complaints_search_vector ON public.complaints USING GIN(search_vector);

-- Function to update search vector
CREATE OR REPLACE FUNCTION public.update_complaint_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update search vector on insert or update
CREATE TRIGGER update_complaints_search_vector
  BEFORE INSERT OR UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_complaint_search_vector();

-- Function to update updated_at timestamp
CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Students can view their own non-anonymous complaints
CREATE POLICY "Students view own complaints"
  ON public.complaints
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

-- RLS Policy: Students can insert complaints
CREATE POLICY "Students insert complaints"
  ON public.complaints
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'student'
    )
  );

-- RLS Policy: Students can update their own draft complaints
CREATE POLICY "Students update own drafts"
  ON public.complaints
  FOR UPDATE
  TO authenticated
  USING (
    student_id = auth.uid() AND is_draft = true
  )
  WITH CHECK (
    student_id = auth.uid() AND is_draft = true
  );

-- RLS Policy: Lecturers and admins can update all complaints
CREATE POLICY "Lecturers update complaints"
  ON public.complaints
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  );

-- RLS Policy: Students can delete their own draft complaints
CREATE POLICY "Students delete own drafts"
  ON public.complaints
  FOR DELETE
  TO authenticated
  USING (
    student_id = auth.uid() AND is_draft = true
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.complaints TO authenticated;
GRANT USAGE ON TYPE complaint_category TO authenticated;
GRANT USAGE ON TYPE complaint_priority TO authenticated;
GRANT USAGE ON TYPE complaint_status TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.complaints IS 'Student complaints with comprehensive tracking and status management';
COMMENT ON COLUMN public.complaints.id IS 'Unique identifier for the complaint';
COMMENT ON COLUMN public.complaints.student_id IS 'References the student who submitted the complaint (null for anonymous)';
COMMENT ON COLUMN public.complaints.is_anonymous IS 'Whether the complaint is submitted anonymously';
COMMENT ON COLUMN public.complaints.is_draft IS 'Whether the complaint is saved as a draft';
COMMENT ON COLUMN public.complaints.title IS 'Brief title of the complaint';
COMMENT ON COLUMN public.complaints.description IS 'Detailed description of the complaint';
COMMENT ON COLUMN public.complaints.category IS 'Category of the complaint';
COMMENT ON COLUMN public.complaints.priority IS 'Priority level of the complaint';
COMMENT ON COLUMN public.complaints.status IS 'Current status of the complaint';
COMMENT ON COLUMN public.complaints.assigned_to IS 'Lecturer or admin assigned to handle the complaint';
COMMENT ON COLUMN public.complaints.opened_at IS 'Timestamp when a lecturer first opened the complaint';
COMMENT ON COLUMN public.complaints.opened_by IS 'User who first opened the complaint';
COMMENT ON COLUMN public.complaints.resolved_at IS 'Timestamp when the complaint was resolved';
COMMENT ON COLUMN public.complaints.escalated_at IS 'Timestamp when the complaint was escalated';
COMMENT ON COLUMN public.complaints.escalation_level IS 'Number of times the complaint has been escalated';
COMMENT ON COLUMN public.complaints.search_vector IS 'Full-text search vector for title and description';

-- Create complaint_templates table
-- This table stores pre-defined templates for common complaint types

-- Create complaint_templates table
CREATE TABLE IF NOT EXISTS public.complaint_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category complaint_category NOT NULL,
  suggested_priority complaint_priority NOT NULL DEFAULT 'medium',
  fields JSONB,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: ensure title is not empty
  CONSTRAINT template_title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
  
  -- Constraint: ensure description is not empty
  CONSTRAINT template_description_not_empty CHECK (LENGTH(TRIM(description)) > 0)
);

-- Create index on created_by for faster lookups
CREATE INDEX IF NOT EXISTS idx_complaint_templates_created_by ON public.complaint_templates(created_by);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_complaint_templates_category ON public.complaint_templates(category);

-- Create index on is_active for filtering active templates
CREATE INDEX IF NOT EXISTS idx_complaint_templates_is_active ON public.complaint_templates(is_active);

-- Create composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_complaint_templates_active_category ON public.complaint_templates(is_active, category);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_complaint_templates_created_at ON public.complaint_templates(created_at DESC);

-- Function to update updated_at timestamp
CREATE TRIGGER update_complaint_templates_updated_at
  BEFORE UPDATE ON public.complaint_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.complaint_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can view active templates
CREATE POLICY "All users view active templates"
  ON public.complaint_templates
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policy: Lecturers and admins can view all templates (including inactive)
CREATE POLICY "Lecturers view all templates"
  ON public.complaint_templates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  );

-- RLS Policy: Lecturers and admins can create templates
CREATE POLICY "Lecturers create templates"
  ON public.complaint_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  );

-- RLS Policy: Lecturers and admins can update templates they created
CREATE POLICY "Lecturers update own templates"
  ON public.complaint_templates
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

-- RLS Policy: Admins can update any template
CREATE POLICY "Admins update all templates"
  ON public.complaint_templates
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- RLS Policy: Lecturers and admins can delete templates they created
CREATE POLICY "Lecturers delete own templates"
  ON public.complaint_templates
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

-- RLS Policy: Admins can delete any template
CREATE POLICY "Admins delete all templates"
  ON public.complaint_templates
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.complaint_templates TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.complaint_templates IS 'Pre-defined templates for common complaint types to speed up submission';
COMMENT ON COLUMN public.complaint_templates.id IS 'Unique identifier for the template';
COMMENT ON COLUMN public.complaint_templates.title IS 'Title of the template';
COMMENT ON COLUMN public.complaint_templates.description IS 'Description or guidance text for the template';
COMMENT ON COLUMN public.complaint_templates.category IS 'Default category for complaints using this template';
COMMENT ON COLUMN public.complaint_templates.suggested_priority IS 'Suggested priority level for complaints using this template';
COMMENT ON COLUMN public.complaint_templates.fields IS 'JSON structure defining template fields and guidance';
COMMENT ON COLUMN public.complaint_templates.created_by IS 'Lecturer or admin who created the template';
COMMENT ON COLUMN public.complaint_templates.is_active IS 'Whether the template is currently active and visible to students';
COMMENT ON COLUMN public.complaint_templates.created_at IS 'Timestamp when the template was created';
COMMENT ON COLUMN public.complaint_templates.updated_at IS 'Timestamp when the template was last updated';

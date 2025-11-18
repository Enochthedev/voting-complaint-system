-- Create escalation_rules table
-- This table stores auto-escalation rules for unaddressed complaints

-- Create escalation_rules table
CREATE TABLE IF NOT EXISTS public.escalation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category complaint_category NOT NULL,
  priority complaint_priority NOT NULL,
  hours_threshold INTEGER NOT NULL,
  escalate_to UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: hours_threshold must be positive
  CONSTRAINT hours_threshold_positive CHECK (hours_threshold > 0),
  
  -- Constraint: ensure unique combination of category and priority when active
  CONSTRAINT unique_active_category_priority UNIQUE (category, priority, is_active)
);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_escalation_rules_category ON public.escalation_rules(category);

-- Create index on priority for filtering
CREATE INDEX IF NOT EXISTS idx_escalation_rules_priority ON public.escalation_rules(priority);

-- Create index on escalate_to for faster lookups
CREATE INDEX IF NOT EXISTS idx_escalation_rules_escalate_to ON public.escalation_rules(escalate_to);

-- Create index on is_active for filtering active rules
CREATE INDEX IF NOT EXISTS idx_escalation_rules_is_active ON public.escalation_rules(is_active);

-- Create composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_escalation_rules_active_category_priority ON public.escalation_rules(is_active, category, priority);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_escalation_rules_created_at ON public.escalation_rules(created_at DESC);

-- Function to update updated_at timestamp
CREATE TRIGGER update_escalation_rules_updated_at
  BEFORE UPDATE ON public.escalation_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.escalation_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Lecturers and admins can view all escalation rules
CREATE POLICY "Lecturers view escalation rules"
  ON public.escalation_rules
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  );

-- RLS Policy: Admins can create escalation rules
CREATE POLICY "Admins create escalation rules"
  ON public.escalation_rules
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- RLS Policy: Admins can update escalation rules
CREATE POLICY "Admins update escalation rules"
  ON public.escalation_rules
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- RLS Policy: Admins can delete escalation rules
CREATE POLICY "Admins delete escalation rules"
  ON public.escalation_rules
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
GRANT ALL ON public.escalation_rules TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.escalation_rules IS 'Auto-escalation rules for unaddressed complaints based on category and priority';
COMMENT ON COLUMN public.escalation_rules.id IS 'Unique identifier for the escalation rule';
COMMENT ON COLUMN public.escalation_rules.category IS 'Complaint category this rule applies to';
COMMENT ON COLUMN public.escalation_rules.priority IS 'Complaint priority this rule applies to';
COMMENT ON COLUMN public.escalation_rules.hours_threshold IS 'Number of hours before escalation triggers';
COMMENT ON COLUMN public.escalation_rules.escalate_to IS 'User (lecturer/admin) to escalate the complaint to';
COMMENT ON COLUMN public.escalation_rules.is_active IS 'Whether this escalation rule is currently active';
COMMENT ON COLUMN public.escalation_rules.created_at IS 'Timestamp when the rule was created';
COMMENT ON COLUMN public.escalation_rules.updated_at IS 'Timestamp when the rule was last updated';

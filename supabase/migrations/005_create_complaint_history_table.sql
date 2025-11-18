-- Create complaint_history table
-- This table stores an immutable audit trail of all actions performed on complaints

-- Create enum for history actions
DO $$ BEGIN
  CREATE TYPE complaint_action AS ENUM (
    'created',
    'status_changed',
    'assigned',
    'reassigned',
    'feedback_added',
    'comment_added',
    'reopened',
    'escalated',
    'rated'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create complaint_history table
CREATE TABLE IF NOT EXISTS public.complaint_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  action complaint_action NOT NULL,
  old_value TEXT,
  new_value TEXT,
  performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_complaint_history_complaint_id ON public.complaint_history(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_history_action ON public.complaint_history(action);
CREATE INDEX IF NOT EXISTS idx_complaint_history_performed_by ON public.complaint_history(performed_by);
CREATE INDEX IF NOT EXISTS idx_complaint_history_created_at ON public.complaint_history(created_at DESC);

-- Create composite index for common query patterns (complaint timeline)
CREATE INDEX IF NOT EXISTS idx_complaint_history_complaint_created ON public.complaint_history(complaint_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.complaint_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view history for accessible complaints
CREATE POLICY "Users view history on accessible complaints"
  ON public.complaint_history
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

-- RLS Policy: Only INSERT allowed (no UPDATE or DELETE for immutability)
-- System/authenticated users can insert history records
CREATE POLICY "System inserts history records"
  ON public.complaint_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON public.complaint_history TO authenticated;
GRANT USAGE ON TYPE complaint_action TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.complaint_history IS 'Immutable audit trail of all actions performed on complaints';
COMMENT ON COLUMN public.complaint_history.id IS 'Unique identifier for the history entry';
COMMENT ON COLUMN public.complaint_history.complaint_id IS 'References the complaint this history entry belongs to';
COMMENT ON COLUMN public.complaint_history.action IS 'Type of action performed';
COMMENT ON COLUMN public.complaint_history.old_value IS 'Previous value before the action (if applicable)';
COMMENT ON COLUMN public.complaint_history.new_value IS 'New value after the action (if applicable)';
COMMENT ON COLUMN public.complaint_history.performed_by IS 'User who performed the action';
COMMENT ON COLUMN public.complaint_history.details IS 'Additional context about the action in JSON format';
COMMENT ON COLUMN public.complaint_history.created_at IS 'Timestamp when the action was performed';

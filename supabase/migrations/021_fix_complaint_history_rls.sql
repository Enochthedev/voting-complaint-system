-- Fix complaint_history RLS policies to ensure immutability
-- This migration ensures that history records cannot be updated or deleted (Property P13)
-- and uses JWT claims to avoid infinite recursion

-- Drop existing policies
DROP POLICY IF EXISTS "Users view history on accessible complaints" ON public.complaint_history;
DROP POLICY IF EXISTS "System inserts history records" ON public.complaint_history;

-- RLS Policy: Users can view history for accessible complaints
-- Students can view history on their own complaints
-- Lecturers and admins can view history on all complaints
CREATE POLICY "Users view history on accessible complaints"
  ON public.complaint_history
  FOR SELECT
  TO authenticated
  USING (
    -- Lecturers and admins can view all history
    (auth.jwt()->>'role' IN ('lecturer', 'admin'))
    OR
    -- Students can view history on their own complaints
    (
      auth.jwt()->>'role' = 'student'
      AND complaint_id IN (
        SELECT id FROM public.complaints
        WHERE student_id = auth.uid()
      )
    )
  );

-- RLS Policy: Only INSERT allowed (no UPDATE or DELETE for immutability - Property P13)
-- System/authenticated users can insert history records
CREATE POLICY "System inserts history records"
  ON public.complaint_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policy: Explicitly deny UPDATE operations to enforce immutability
-- This ensures history records cannot be modified after creation
CREATE POLICY "Deny history updates"
  ON public.complaint_history
  FOR UPDATE
  TO authenticated
  USING (false);

-- RLS Policy: Explicitly deny DELETE operations to enforce immutability
-- This ensures history records cannot be deleted after creation
CREATE POLICY "Deny history deletes"
  ON public.complaint_history
  FOR DELETE
  TO authenticated
  USING (false);

-- Revoke UPDATE and DELETE permissions to further enforce immutability
REVOKE UPDATE, DELETE ON public.complaint_history FROM authenticated;

-- Grant only SELECT and INSERT permissions
GRANT SELECT, INSERT ON public.complaint_history TO authenticated;

-- Comment for documentation
COMMENT ON POLICY "Users view history on accessible complaints" ON public.complaint_history IS 
  'Students can view history on their own complaints; Lecturers and admins can view all history';
COMMENT ON POLICY "System inserts history records" ON public.complaint_history IS 
  'Authenticated users can insert history records for audit trail';
COMMENT ON POLICY "Deny history updates" ON public.complaint_history IS 
  'Explicitly deny UPDATE operations to enforce immutability (Property P13)';
COMMENT ON POLICY "Deny history deletes" ON public.complaint_history IS 
  'Explicitly deny DELETE operations to enforce immutability (Property P13)';


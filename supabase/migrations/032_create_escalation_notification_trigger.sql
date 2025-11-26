-- Create trigger for escalation notification
-- This migration adds a trigger to notify users when a complaint is escalated to them

-- ============================================================================
-- TRIGGER: Notify user when a complaint is escalated to them
-- ============================================================================

-- Function to notify user when a complaint is escalated
CREATE OR REPLACE FUNCTION public.notify_user_on_escalation()
RETURNS TRIGGER AS $$
DECLARE
  v_complaint_title TEXT;
  v_complaint_category TEXT;
  v_complaint_priority TEXT;
BEGIN
  -- Only notify when escalated_at changes from NULL to a value (first escalation)
  -- or when escalation_level increases (re-escalation)
  IF (OLD.escalated_at IS NULL AND NEW.escalated_at IS NOT NULL) OR
     (OLD.escalation_level IS DISTINCT FROM NEW.escalation_level AND NEW.escalation_level > COALESCE(OLD.escalation_level, 0)) THEN
    
    -- Get the complaint details
    v_complaint_title := NEW.title;
    v_complaint_category := NEW.category;
    v_complaint_priority := NEW.priority;
    
    -- Notify the user who the complaint was escalated to
    -- This could be the assigned_to user if assignment changed during escalation
    IF NEW.assigned_to IS NOT NULL THEN
      INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        related_id,
        is_read
      ) VALUES (
        NEW.assigned_to,
        'complaint_escalated',
        'Complaint escalated to you',
        'Complaint "' || v_complaint_title || '" (' || v_complaint_category || ', ' || v_complaint_priority || ' priority) has been escalated to you',
        NEW.id,
        false
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for escalation notification
CREATE TRIGGER notify_on_complaint_escalation
  AFTER UPDATE ON public.complaints
  FOR EACH ROW
  WHEN (
    (OLD.escalated_at IS NULL AND NEW.escalated_at IS NOT NULL) OR
    (OLD.escalation_level IS DISTINCT FROM NEW.escalation_level AND NEW.escalation_level > COALESCE(OLD.escalation_level, 0))
  )
  EXECUTE FUNCTION public.notify_user_on_escalation();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.notify_user_on_escalation() TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION public.notify_user_on_escalation() IS 'Sends notification to the assigned user when a complaint is escalated to them';
COMMENT ON TRIGGER notify_on_complaint_escalation ON public.complaints IS 'Trigger to notify users when complaints are escalated';

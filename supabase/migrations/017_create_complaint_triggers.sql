-- Create triggers for complaint table
-- This migration adds triggers for automatic history logging and notifications

-- ============================================================================
-- TRIGGER 1: Auto-create History Entry on Status Change
-- ============================================================================

-- Function to log complaint status changes
CREATE OR REPLACE FUNCTION public.log_complaint_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.complaint_history (
      complaint_id,
      action,
      old_value,
      new_value,
      performed_by,
      details
    ) VALUES (
      NEW.id,
      'status_changed',
      OLD.status::text,
      NEW.status::text,
      auth.uid(),
      jsonb_build_object(
        'previous_status', OLD.status,
        'new_status', NEW.status,
        'timestamp', NOW()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for status change logging
CREATE TRIGGER complaint_status_change_trigger
  AFTER UPDATE ON public.complaints
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.log_complaint_status_change();

-- ============================================================================
-- TRIGGER 2: Auto-create Notification on Status Change
-- ============================================================================

-- Function to notify student when complaint is opened
CREATE OR REPLACE FUNCTION public.notify_student_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify student when complaint is opened (new -> opened)
  IF NEW.status = 'opened' AND OLD.status = 'new' AND NEW.student_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_id,
      is_read
    ) VALUES (
      NEW.student_id,
      'complaint_opened',
      'Your complaint has been opened',
      'A lecturer has opened your complaint: ' || NEW.title,
      NEW.id,
      false
    );
  END IF;
  
  -- Notify student when feedback is added (status changes to in_progress or resolved)
  IF NEW.status IN ('in_progress', 'resolved') AND OLD.status != NEW.status AND NEW.student_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_id,
      is_read
    ) VALUES (
      NEW.student_id,
      'complaint_updated',
      'Your complaint status has been updated',
      'Your complaint "' || NEW.title || '" is now ' || NEW.status::text,
      NEW.id,
      false
    );
  END IF;
  
  -- Notify assigned lecturer when complaint is assigned
  IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_id,
      is_read
    ) VALUES (
      NEW.assigned_to,
      'complaint_assigned',
      'A complaint has been assigned to you',
      'You have been assigned complaint: ' || NEW.title,
      NEW.id,
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for notification on status change
CREATE TRIGGER notify_on_complaint_status_change
  AFTER UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_student_on_status_change();

-- ============================================================================
-- TRIGGER 3: Notify lecturers on new complaint submission
-- ============================================================================

-- Function to notify lecturers when a new complaint is submitted
CREATE OR REPLACE FUNCTION public.notify_lecturers_on_new_complaint()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify when a complaint moves from draft to new (actual submission)
  IF NEW.status = 'new' AND NEW.is_draft = false THEN
    -- Insert notification for all lecturers and admins
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_id,
      is_read
    )
    SELECT 
      u.id,
      'new_complaint',
      'New complaint submitted',
      'A new complaint has been submitted: ' || NEW.title,
      NEW.id,
      false
    FROM public.users u
    WHERE u.role IN ('lecturer', 'admin');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new complaint notification
CREATE TRIGGER notify_on_new_complaint
  AFTER INSERT ON public.complaints
  FOR EACH ROW
  WHEN (NEW.status = 'new' AND NEW.is_draft = false)
  EXECUTE FUNCTION public.notify_lecturers_on_new_complaint();

-- ============================================================================
-- TRIGGER 4: Log complaint creation in history
-- ============================================================================

-- Function to log complaint creation
CREATE OR REPLACE FUNCTION public.log_complaint_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the creation of a new complaint (only for non-draft complaints)
  IF NEW.is_draft = false THEN
    INSERT INTO public.complaint_history (
      complaint_id,
      action,
      old_value,
      new_value,
      performed_by,
      details
    ) VALUES (
      NEW.id,
      'created',
      NULL,
      NEW.status::text,
      COALESCE(NEW.student_id, auth.uid()),
      jsonb_build_object(
        'category', NEW.category,
        'priority', NEW.priority,
        'is_anonymous', NEW.is_anonymous,
        'timestamp', NOW()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for complaint creation logging
CREATE TRIGGER log_complaint_creation_trigger
  AFTER INSERT ON public.complaints
  FOR EACH ROW
  WHEN (NEW.is_draft = false)
  EXECUTE FUNCTION public.log_complaint_creation();

-- ============================================================================
-- TRIGGER 5: Log complaint assignment changes
-- ============================================================================

-- Function to log complaint assignment
CREATE OR REPLACE FUNCTION public.log_complaint_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Log assignment changes
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    INSERT INTO public.complaint_history (
      complaint_id,
      action,
      old_value,
      new_value,
      performed_by,
      details
    ) VALUES (
      NEW.id,
      CASE 
        WHEN OLD.assigned_to IS NULL THEN 'assigned'
        ELSE 'reassigned'
      END,
      OLD.assigned_to::text,
      NEW.assigned_to::text,
      auth.uid(),
      jsonb_build_object(
        'previous_assignee', OLD.assigned_to,
        'new_assignee', NEW.assigned_to,
        'timestamp', NOW()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for assignment logging
CREATE TRIGGER log_complaint_assignment_trigger
  AFTER UPDATE ON public.complaints
  FOR EACH ROW
  WHEN (OLD.assigned_to IS DISTINCT FROM NEW.assigned_to)
  EXECUTE FUNCTION public.log_complaint_assignment();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.log_complaint_status_change() TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_student_on_status_change() TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_lecturers_on_new_complaint() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_complaint_creation() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_complaint_assignment() TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION public.log_complaint_status_change() IS 'Automatically logs complaint status changes to complaint_history table';
COMMENT ON FUNCTION public.notify_student_on_status_change() IS 'Sends notifications to students when their complaint status changes';
COMMENT ON FUNCTION public.notify_lecturers_on_new_complaint() IS 'Notifies all lecturers and admins when a new complaint is submitted';
COMMENT ON FUNCTION public.log_complaint_creation() IS 'Logs the creation of new complaints in the history table';
COMMENT ON FUNCTION public.log_complaint_assignment() IS 'Logs complaint assignment and reassignment changes';

COMMENT ON TRIGGER complaint_status_change_trigger ON public.complaints IS 'Trigger to log status changes in complaint_history';
COMMENT ON TRIGGER notify_on_complaint_status_change ON public.complaints IS 'Trigger to notify users of complaint status changes';
COMMENT ON TRIGGER notify_on_new_complaint ON public.complaints IS 'Trigger to notify lecturers of new complaints';
COMMENT ON TRIGGER log_complaint_creation_trigger ON public.complaints IS 'Trigger to log complaint creation in history';
COMMENT ON TRIGGER log_complaint_assignment_trigger ON public.complaints IS 'Trigger to log assignment changes';

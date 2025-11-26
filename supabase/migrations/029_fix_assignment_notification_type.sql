-- Fix assignment notification type in trigger
-- The trigger was using 'complaint_assigned' but the enum has 'assignment'

-- Update the trigger function to use the correct notification type
CREATE OR REPLACE FUNCTION public.notify_student_on_status_change()
RETURNS TRIGGER AS $
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
      'complaint_update',  -- Using existing enum value
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
      'complaint_update',  -- Using existing enum value
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
      'assignment',  -- Using existing enum value instead of 'complaint_assigned'
      'A complaint has been assigned to you',
      'You have been assigned complaint: ' || NEW.title,
      NEW.id,
      false
    );
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment for documentation
COMMENT ON FUNCTION public.notify_student_on_status_change() IS 'Sends notifications to students and lecturers when complaint status changes or assignments occur. Updated to use correct notification_type enum values.';

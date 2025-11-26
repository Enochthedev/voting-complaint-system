-- Create trigger for new announcement notifications
-- This migration adds a trigger to notify all students when a new announcement is created

-- ============================================================================
-- TRIGGER: Notify students when a new announcement is created
-- ============================================================================

-- Function to notify students when a new announcement is created
CREATE OR REPLACE FUNCTION public.notify_students_on_new_announcement()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for all students
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
    'new_announcement',
    'New announcement',
    'A new announcement has been posted: ' || NEW.title,
    NEW.id,
    false
  FROM public.users u
  WHERE u.role = 'student';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new announcement notification
CREATE TRIGGER notify_on_new_announcement
  AFTER INSERT ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_students_on_new_announcement();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.notify_students_on_new_announcement() TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION public.notify_students_on_new_announcement() IS 'Notifies all students when a new announcement is created';
COMMENT ON TRIGGER notify_on_new_announcement ON public.announcements IS 'Trigger to notify students of new announcements';

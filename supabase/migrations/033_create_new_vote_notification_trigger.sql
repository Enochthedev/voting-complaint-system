-- Create trigger for new vote notifications
-- This migration adds a trigger to notify all students when a new vote is created

-- ============================================================================
-- TRIGGER: Notify students when a new vote is created
-- ============================================================================

-- Function to notify students when a new vote is created
CREATE OR REPLACE FUNCTION public.notify_students_on_new_vote()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify when a new vote is created and is active
  IF NEW.is_active = true THEN
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
      'new_vote',
      'New vote available',
      'A new vote has been created: ' || NEW.title,
      NEW.id,
      false
    FROM public.users u
    WHERE u.role = 'student';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new vote notification
CREATE TRIGGER notify_on_new_vote
  AFTER INSERT ON public.votes
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION public.notify_students_on_new_vote();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.notify_students_on_new_vote() TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION public.notify_students_on_new_vote() IS 'Notifies all students when a new active vote is created';
COMMENT ON TRIGGER notify_on_new_vote ON public.votes IS 'Trigger to notify students of new votes';


-- Create trigger for feedback received notification
-- This migration adds a trigger to notify students when they receive feedback on their complaints

-- ============================================================================
-- Add feedback_received to notification_type enum if not exists
-- ============================================================================

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'feedback_received';

-- ============================================================================
-- TRIGGER: Notify student when feedback is received
-- ============================================================================

-- Function to notify student when feedback is added to their complaint
CREATE OR REPLACE FUNCTION public.notify_student_on_feedback()
RETURNS TRIGGER AS $$
DECLARE
  v_complaint_title TEXT;
  v_student_id UUID;
BEGIN
  -- Get the complaint details (title and student_id)
  SELECT c.title, c.student_id
  INTO v_complaint_title, v_student_id
  FROM public.complaints c
  WHERE c.id = NEW.complaint_id;
  
  -- Only notify if the complaint has a student_id (not anonymous or has student)
  IF v_student_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_id,
      is_read
    ) VALUES (
      v_student_id,
      'feedback_received',
      'You received feedback on your complaint',
      'A lecturer has provided feedback on your complaint: ' || v_complaint_title,
      NEW.complaint_id,
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for feedback notification
CREATE TRIGGER notify_on_feedback_received
  AFTER INSERT ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_student_on_feedback();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.notify_student_on_feedback() TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION public.notify_student_on_feedback() IS 'Sends notification to student when a lecturer provides feedback on their complaint';
COMMENT ON TRIGGER notify_on_feedback_received ON public.feedback IS 'Trigger to notify students when they receive feedback on their complaints';

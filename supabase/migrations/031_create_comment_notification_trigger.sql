-- Create trigger for comment added notification
-- This migration adds a trigger to notify relevant users when a comment is added to a complaint

-- ============================================================================
-- TRIGGER: Notify users when a comment is added
-- ============================================================================

-- Function to notify relevant users when a comment is added to a complaint
CREATE OR REPLACE FUNCTION public.notify_users_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_complaint_title TEXT;
  v_student_id UUID;
  v_assigned_to UUID;
  v_commenter_name TEXT;
  v_commenter_role TEXT;
BEGIN
  -- Get the complaint details (title, student_id, assigned_to)
  SELECT c.title, c.student_id, c.assigned_to
  INTO v_complaint_title, v_student_id, v_assigned_to
  FROM public.complaints c
  WHERE c.id = NEW.complaint_id;
  
  -- Get the commenter's name and role
  SELECT u.full_name, u.role
  INTO v_commenter_name, v_commenter_role
  FROM public.users u
  WHERE u.id = NEW.user_id;
  
  -- Don't notify for internal notes (only lecturers can see them anyway)
  IF NEW.is_internal = true THEN
    RETURN NEW;
  END IF;
  
  -- Notify the student if they are not the commenter
  IF v_student_id IS NOT NULL AND v_student_id != NEW.user_id THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_id,
      is_read
    ) VALUES (
      v_student_id,
      'comment_added'::notification_type,
      'New comment on your complaint',
      COALESCE(v_commenter_name, 'Someone') || ' commented on your complaint: ' || v_complaint_title,
      NEW.complaint_id,
      false
    );
  END IF;
  
  -- Notify the assigned lecturer if they are not the commenter
  IF v_assigned_to IS NOT NULL AND v_assigned_to != NEW.user_id THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_id,
      is_read
    ) VALUES (
      v_assigned_to,
      'comment_added'::notification_type,
      'New comment on assigned complaint',
      COALESCE(v_commenter_name, 'Someone') || ' commented on complaint: ' || v_complaint_title,
      NEW.complaint_id,
      false
    );
  END IF;
  
  -- Notify all other lecturers/admins who have commented on this complaint (excluding the current commenter)
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    related_id,
    is_read
  )
  SELECT DISTINCT
    cc.user_id,
    'comment_added'::notification_type,
    'New comment on complaint',
    COALESCE(v_commenter_name, 'Someone') || ' commented on complaint: ' || v_complaint_title,
    NEW.complaint_id,
    false
  FROM public.complaint_comments cc
  INNER JOIN public.users u ON cc.user_id = u.id
  WHERE cc.complaint_id = NEW.complaint_id
    AND cc.user_id != NEW.user_id
    AND cc.user_id != v_student_id
    AND cc.user_id != v_assigned_to
    AND u.role IN ('lecturer', 'admin')
    AND cc.is_internal = false;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for comment notification
CREATE TRIGGER notify_on_comment_added
  AFTER INSERT ON public.complaint_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_users_on_comment();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.notify_users_on_comment() TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION public.notify_users_on_comment() IS 'Sends notifications to relevant users (student, assigned lecturer, and other participants) when a comment is added to a complaint';
COMMENT ON TRIGGER notify_on_comment_added ON public.complaint_comments IS 'Trigger to notify users when comments are added to complaints';

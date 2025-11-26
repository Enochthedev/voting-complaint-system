-- Add missing history logging triggers
-- This migration adds triggers to log feedback and comment actions in complaint_history

-- ============================================================================
-- TRIGGER: Log feedback addition in complaint history
-- ============================================================================

-- Function to log feedback addition
CREATE OR REPLACE FUNCTION public.log_feedback_addition()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the feedback addition in complaint history
  INSERT INTO public.complaint_history (
    complaint_id,
    action,
    old_value,
    new_value,
    performed_by,
    details
  ) VALUES (
    NEW.complaint_id,
    'feedback_added',
    NULL,
    LEFT(NEW.content, 100), -- Store first 100 chars of feedback
    NEW.lecturer_id,
    jsonb_build_object(
      'feedback_id', NEW.id,
      'timestamp', NOW()
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for feedback logging
CREATE TRIGGER log_feedback_addition_trigger
  AFTER INSERT ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.log_feedback_addition();

-- ============================================================================
-- TRIGGER: Log comment addition in complaint history
-- ============================================================================

-- Function to log comment addition
CREATE OR REPLACE FUNCTION public.log_comment_addition()
RETURNS TRIGGER AS $$
DECLARE
  v_comment_type TEXT;
BEGIN
  -- Determine comment type
  v_comment_type := CASE 
    WHEN NEW.is_internal THEN 'internal_note'
    ELSE 'comment'
  END;
  
  -- Log the comment addition in complaint history
  INSERT INTO public.complaint_history (
    complaint_id,
    action,
    old_value,
    new_value,
    performed_by,
    details
  ) VALUES (
    NEW.complaint_id,
    'comment_added',
    NULL,
    LEFT(NEW.comment, 100), -- Store first 100 chars of comment
    NEW.user_id,
    jsonb_build_object(
      'comment_id', NEW.id,
      'is_internal', NEW.is_internal,
      'comment_type', v_comment_type,
      'timestamp', NOW()
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for comment logging
CREATE TRIGGER log_comment_addition_trigger
  AFTER INSERT ON public.complaint_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.log_comment_addition();

-- ============================================================================
-- TRIGGER: Log comment editing in complaint history
-- ============================================================================

-- Function to log comment edits
CREATE OR REPLACE FUNCTION public.log_comment_edit()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if comment text actually changed
  IF OLD.comment IS DISTINCT FROM NEW.comment THEN
    INSERT INTO public.complaint_history (
      complaint_id,
      action,
      old_value,
      new_value,
      performed_by,
      details
    ) VALUES (
      NEW.complaint_id,
      'comment_added', -- Use comment_added action for edits too
      LEFT(OLD.comment, 100),
      LEFT(NEW.comment, 100),
      NEW.user_id,
      jsonb_build_object(
        'comment_id', NEW.id,
        'is_internal', NEW.is_internal,
        'action_type', 'edited',
        'timestamp', NOW()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for comment edit logging
CREATE TRIGGER log_comment_edit_trigger
  AFTER UPDATE ON public.complaint_comments
  FOR EACH ROW
  WHEN (OLD.comment IS DISTINCT FROM NEW.comment)
  EXECUTE FUNCTION public.log_comment_edit();

-- ============================================================================
-- TRIGGER: Log comment deletion in complaint history
-- ============================================================================

-- Function to log comment deletion
CREATE OR REPLACE FUNCTION public.log_comment_deletion()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.complaint_history (
    complaint_id,
    action,
    old_value,
    new_value,
    performed_by,
    details
  ) VALUES (
    OLD.complaint_id,
    'comment_added', -- Use comment_added action for deletions too
    LEFT(OLD.comment, 100),
    NULL,
    OLD.user_id,
    jsonb_build_object(
      'comment_id', OLD.id,
      'is_internal', OLD.is_internal,
      'action_type', 'deleted',
      'timestamp', NOW()
    )
  );
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for comment deletion logging
CREATE TRIGGER log_comment_deletion_trigger
  BEFORE DELETE ON public.complaint_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.log_comment_deletion();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.log_feedback_addition() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_comment_addition() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_comment_edit() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_comment_deletion() TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION public.log_feedback_addition() IS 'Automatically logs feedback additions to complaint_history table';
COMMENT ON FUNCTION public.log_comment_addition() IS 'Automatically logs comment additions to complaint_history table';
COMMENT ON FUNCTION public.log_comment_edit() IS 'Automatically logs comment edits to complaint_history table';
COMMENT ON FUNCTION public.log_comment_deletion() IS 'Automatically logs comment deletions to complaint_history table';

COMMENT ON TRIGGER log_feedback_addition_trigger ON public.feedback IS 'Trigger to log feedback additions in complaint history';
COMMENT ON TRIGGER log_comment_addition_trigger ON public.complaint_comments IS 'Trigger to log comment additions in complaint history';
COMMENT ON TRIGGER log_comment_edit_trigger ON public.complaint_comments IS 'Trigger to log comment edits in complaint history';
COMMENT ON TRIGGER log_comment_deletion_trigger ON public.complaint_comments IS 'Trigger to log comment deletions in complaint history';


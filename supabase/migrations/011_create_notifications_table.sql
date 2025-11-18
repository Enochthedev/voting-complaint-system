-- Create notifications table
-- This table stores in-app notifications for users
-- Notifications are triggered by various events in the system

-- Create notification type enum
CREATE TYPE notification_type AS ENUM (
  'complaint_opened',
  'feedback_received',
  'new_complaint',
  'new_announcement',
  'new_vote',
  'comment_added',
  'complaint_assigned',
  'complaint_escalated',
  'complaint_reopened',
  'status_changed'
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: title and message cannot be empty
  CONSTRAINT non_empty_title CHECK (LENGTH(TRIM(title)) > 0),
  CONSTRAINT non_empty_message CHECK (LENGTH(TRIM(message)) > 0)
);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_related_id ON public.notifications(related_id);

-- Create composite index for common query patterns (unread notifications for a user)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

-- Create composite index for user notifications by type
CREATE INDEX IF NOT EXISTS idx_notifications_user_type ON public.notifications(user_id, type, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own notifications
CREATE POLICY "Users view own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users update own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: System can insert notifications (via triggers or functions)
-- This allows authenticated users to create notifications through application logic
CREATE POLICY "System insert notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policy: Users can delete their own notifications
CREATE POLICY "Users delete own notifications"
  ON public.notifications
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.notifications TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.notifications IS 'In-app notifications for users triggered by various system events';
COMMENT ON COLUMN public.notifications.id IS 'Unique identifier for the notification';
COMMENT ON COLUMN public.notifications.user_id IS 'User who receives this notification';
COMMENT ON COLUMN public.notifications.type IS 'Type of notification event';
COMMENT ON COLUMN public.notifications.title IS 'Notification title/heading';
COMMENT ON COLUMN public.notifications.message IS 'Notification message content';
COMMENT ON COLUMN public.notifications.related_id IS 'ID of related entity (complaint, announcement, vote, etc.)';
COMMENT ON COLUMN public.notifications.is_read IS 'Whether the user has read this notification';
COMMENT ON COLUMN public.notifications.created_at IS 'Timestamp when the notification was created';


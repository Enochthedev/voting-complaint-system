-- Apply all fixes for votes, announcements, and notifications
-- Run this script in your Supabase SQL editor to apply all fixes at once

-- ============================================================================
-- FIX 1: Votes SELECT Policy
-- ============================================================================
-- Migration 025 accidentally removed the SELECT policy for votes
-- This prevents students from viewing votes

DROP POLICY IF EXISTS "All users view votes" ON public.votes;
DROP POLICY IF EXISTS "Users view votes" ON public.votes;
DROP POLICY IF EXISTS "Students view votes" ON public.votes;

CREATE POLICY "All users view votes"
  ON public.votes
  FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON POLICY "All users view votes" ON public.votes IS 'All authenticated users can view votes regardless of role';

-- ============================================================================
-- FIX 2: Announcements SELECT Policy  
-- ============================================================================
-- Migration 026 accidentally removed the SELECT policy for announcements
-- This prevents students from viewing announcements

DROP POLICY IF EXISTS "All users view announcements" ON public.announcements;
DROP POLICY IF EXISTS "Users view announcements" ON public.announcements;
DROP POLICY IF EXISTS "Students view announcements" ON public.announcements;

CREATE POLICY "All users view announcements"
  ON public.announcements
  FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON POLICY "All users view announcements" ON public.announcements IS 'All authenticated users can view announcements regardless of role';

-- ============================================================================
-- VERIFICATION: Check that all notification triggers exist
-- ============================================================================
-- This query will show you all the triggers on relevant tables
-- Make sure these triggers exist:
-- - notify_on_new_vote (votes table)
-- - notify_on_new_announcement (announcements table)
-- - notify_on_comment_added (complaint_comments table)
-- - notify_on_feedback_added (feedback table)
-- - notify_on_complaint_escalated (complaints table)

SELECT 
  t.tgname AS trigger_name,
  c.relname AS table_name,
  p.proname AS function_name,
  t.tgenabled AS enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname IN ('votes', 'announcements', 'complaint_comments', 'feedback', 'complaints')
  AND t.tgname LIKE 'notify%'
ORDER BY c.relname, t.tgname;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
-- If you see this message, all fixes have been applied successfully!
SELECT 'All RLS policy fixes applied successfully!' AS status;

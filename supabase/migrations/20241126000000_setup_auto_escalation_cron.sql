-- Migration: Setup Auto-Escalation Cron Job
-- Description: Creates a cron job to run the auto-escalate-complaints Edge Function every hour
-- This will automatically escalate complaints based on configured escalation rules

-- First, ensure pg_cron extension is enabled
create extension if not exists pg_cron;

-- Store the project URL and anon key in Supabase Vault for secure access
-- Note: These values need to be set manually for your environment
-- For local development: Use http://host.docker.internal:54321
-- For production: Use your actual project URL from the Supabase dashboard

-- Create secrets if they don't exist (this will fail silently if they already exist)
do $$
begin
  -- Try to create the project_url secret
  -- In production, replace with: https://your-project-ref.supabase.co
  -- In local dev, use: http://host.docker.internal:54321
  perform vault.create_secret(
    coalesce(
      current_setting('app.project_url', true),
      'http://host.docker.internal:54321'
    ),
    'project_url'
  );
exception
  when others then
    -- Secret might already exist, that's okay
    raise notice 'project_url secret may already exist or vault is not available';
end;
$$;

do $$
begin
  -- Try to create the anon_key secret
  -- In production, replace with your actual anon key from the Supabase dashboard
  perform vault.create_secret(
    coalesce(
      current_setting('app.anon_key', true),
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
    ),
    'anon_key'
  );
exception
  when others then
    -- Secret might already exist, that's okay
    raise notice 'anon_key secret may already exist or vault is not available';
end;
$$;

-- Schedule the auto-escalation job to run every hour
-- The job will invoke the auto-escalate-complaints Edge Function
select cron.schedule(
  'auto-escalate-complaints-hourly',  -- Job name
  '0 * * * *',                         -- Cron expression: At minute 0 of every hour
  $$
  select
    net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') 
             || '/functions/v1/auto-escalate-complaints',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key')
      ),
      body := jsonb_build_object('time', now()),
      timeout_milliseconds := 300000  -- 5 minute timeout
    ) as request_id;
  $$
);

-- Add a comment to document the cron job
comment on extension pg_cron is 'Enables scheduling of recurring jobs using cron syntax';

-- Query to verify the cron job was created successfully
-- Uncomment to run after migration:
-- select jobid, jobname, schedule, active, command 
-- from cron.job 
-- where jobname = 'auto-escalate-complaints-hourly';

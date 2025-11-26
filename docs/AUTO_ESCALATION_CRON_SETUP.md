# Auto-Escalation Cron Job Setup

This document explains how to set up and manage the hourly cron job that automatically escalates complaints based on configured escalation rules.

## Overview

The auto-escalation system uses:
- **Supabase Edge Function**: `auto-escalate-complaints` (processes escalation logic)
- **pg_cron Extension**: Schedules the function to run every hour
- **pg_net Extension**: Makes HTTP requests from Postgres to invoke the Edge Function
- **Supabase Vault**: Securely stores project URL and API keys

## Setup Instructions

### 1. Apply the Migration

The cron job is set up via a database migration. Apply it using:

```bash
# For local development
supabase db reset

# For production
supabase db push
```

### 2. Configure Secrets (Production Only)

For production environments, you need to update the Vault secrets with your actual project URL and anon key.

#### Get Your Project Details

1. Go to your Supabase Dashboard
2. Navigate to Settings > API
3. Copy your:
   - **Project URL** (e.g., `https://your-project-ref.supabase.co`)
   - **Anon/Public Key**

#### Update Vault Secrets

Run these SQL commands in the SQL Editor:

```sql
-- Update project URL
select vault.update_secret(
  (select id from vault.secrets where name = 'project_url'),
  'https://your-project-ref.supabase.co'
);

-- Update anon key
select vault.update_secret(
  (select id from vault.secrets where name = 'anon_key'),
  'your-actual-anon-key-here'
);
```

### 3. Verify the Cron Job

Check that the cron job was created successfully:

```sql
select 
  jobid, 
  jobname, 
  schedule, 
  active, 
  command 
from cron.job 
where jobname = 'auto-escalate-complaints-hourly';
```

Expected output:
- **jobname**: `auto-escalate-complaints-hourly`
- **schedule**: `0 * * * *` (every hour at minute 0)
- **active**: `true`

## Managing the Cron Job

### View Job Status

```sql
-- Check if the job is active
select jobid, jobname, schedule, active
from cron.job
where jobname = 'auto-escalate-complaints-hourly';
```

### View Job Run History

```sql
-- View recent job runs
select 
  runid,
  jobid,
  status,
  return_message,
  start_time,
  end_time
from cron.job_run_details
where jobid = (
  select jobid 
  from cron.job 
  where jobname = 'auto-escalate-complaints-hourly'
)
order by start_time desc
limit 10;
```

### Pause the Cron Job

```sql
-- Deactivate the job (stops it from running)
select cron.alter_job(
  job_id := (select jobid from cron.job where jobname = 'auto-escalate-complaints-hourly'),
  active := false
);
```

### Resume the Cron Job

```sql
-- Reactivate the job
select cron.alter_job(
  job_id := (select jobid from cron.job where jobname = 'auto-escalate-complaints-hourly'),
  active := true
);
```

### Change the Schedule

```sql
-- Change to run every 30 minutes
select cron.alter_job(
  job_id := (select jobid from cron.job where jobname = 'auto-escalate-complaints-hourly'),
  schedule := '*/30 * * * *'
);

-- Change to run every 2 hours
select cron.alter_job(
  job_id := (select jobid from cron.job where jobname = 'auto-escalate-complaints-hourly'),
  schedule := '0 */2 * * *'
);

-- Change to run daily at 9 AM
select cron.alter_job(
  job_id := (select jobid from cron.job where jobname = 'auto-escalate-complaints-hourly'),
  schedule := '0 9 * * *'
);
```

### Delete the Cron Job

```sql
-- Permanently remove the cron job
select cron.unschedule('auto-escalate-complaints-hourly');
```

## Cron Schedule Syntax

The cron schedule uses standard cron syntax:

```
┌───────────── minute (0 - 59)
│ ┌────────────── hour (0 - 23)
│ │ ┌─────────────── day of month (1 - 31)
│ │ │ ┌──────────────── month (1 - 12)
│ │ │ │ ┌───────────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

### Common Examples

- `0 * * * *` - Every hour at minute 0
- `*/30 * * * *` - Every 30 minutes
- `0 */2 * * *` - Every 2 hours
- `0 9 * * *` - Daily at 9:00 AM
- `0 9 * * 1` - Every Monday at 9:00 AM
- `0 0 1 * *` - First day of every month at midnight

## Monitoring

### Check HTTP Responses

The `pg_net` extension stores HTTP responses in the `net._http_response` table:

```sql
-- View recent Edge Function responses
select 
  id,
  status_code,
  content,
  error_msg,
  created
from net._http_response
order by created desc
limit 10;
```

### Check for Errors

```sql
-- Find failed requests
select 
  id,
  status_code,
  error_msg,
  content,
  created
from net._http_response
where status_code >= 400 or error_msg is not null
order by created desc;
```

### View Escalation History

```sql
-- View recent escalations
select 
  ch.complaint_id,
  c.title,
  ch.action,
  ch.new_value,
  ch.performed_by,
  ch.details,
  ch.created_at
from complaint_history ch
join complaints c on c.id = ch.complaint_id
where ch.action = 'escalated'
  and (ch.details->>'auto_escalated')::boolean = true
order by ch.created_at desc
limit 20;
```

## Troubleshooting

### Job Not Running

1. **Check if the job is active:**
   ```sql
   select active from cron.job where jobname = 'auto-escalate-complaints-hourly';
   ```

2. **Check for errors in job runs:**
   ```sql
   select status, return_message
   from cron.job_run_details
   where jobid = (select jobid from cron.job where jobname = 'auto-escalate-complaints-hourly')
   order by start_time desc
   limit 5;
   ```

3. **Verify pg_cron extension is enabled:**
   ```sql
   select * from pg_extension where extname = 'pg_cron';
   ```

### Edge Function Not Being Called

1. **Check Vault secrets are set:**
   ```sql
   select name from vault.secrets where name in ('project_url', 'anon_key');
   ```

2. **Verify pg_net extension is enabled:**
   ```sql
   select * from pg_extension where extname = 'pg_net';
   ```

3. **Check HTTP response logs:**
   ```sql
   select * from net._http_response order by created desc limit 5;
   ```

### No Complaints Being Escalated

1. **Check if there are active escalation rules:**
   ```sql
   select * from escalation_rules where is_active = true;
   ```

2. **Check if there are complaints that meet escalation criteria:**
   ```sql
   -- Example: Check for complaints older than 24 hours
   select 
     id,
     title,
     category,
     priority,
     status,
     created_at,
     escalated_at
   from complaints
   where status in ('new', 'opened')
     and escalated_at is null
     and created_at < now() - interval '24 hours';
   ```

3. **Manually test the Edge Function:**
   ```bash
   curl -X POST https://your-project-ref.supabase.co/functions/v1/auto-escalate-complaints \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"time": "2024-11-26T10:00:00Z"}'
   ```

## Local Development

For local development, the migration uses default values:
- **Project URL**: `http://host.docker.internal:54321`
- **Anon Key**: Default Supabase local development key

These work out of the box with `supabase start`.

To test the cron job locally:

```bash
# Start Supabase
supabase start

# The cron job will run automatically every hour
# To trigger it manually, run:
supabase functions invoke auto-escalate-complaints
```

## Best Practices

1. **Monitor regularly**: Check job run history and HTTP responses weekly
2. **Set appropriate schedules**: Hourly is a good default, but adjust based on your needs
3. **Test escalation rules**: Create test rules and complaints to verify the system works
4. **Keep Vault secrets secure**: Never commit actual API keys to version control
5. **Clean up old data**: Periodically clean up old entries in `cron.job_run_details` and `net._http_response`

## Related Documentation

- [Auto-Escalation System](./AUTO_ESCALATION_SYSTEM.md)
- [Auto-Escalation Quick Start](./AUTO_ESCALATION_QUICK_START.md)
- [Escalation Rules Implementation](./ESCALATION_RULES_IMPLEMENTATION_CHECKLIST.md)
- [Task 10.2 Edge Function Summary](../TASK_10.2_EDGE_FUNCTION_SUMMARY.md)

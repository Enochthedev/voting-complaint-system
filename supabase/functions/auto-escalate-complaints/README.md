# Auto-Escalate Complaints Edge Function

## Overview

This Supabase Edge Function automatically escalates complaints that have not been addressed within the configured time threshold. It runs periodically via a cron job to check for complaints matching active escalation rules.

## Functionality

The function performs the following operations:

1. **Fetch Active Rules**: Retrieves all active escalation rules from the `escalation_rules` table
2. **Find Eligible Complaints**: For each rule, finds complaints that:
   - Match the rule's category and priority
   - Are in 'new' or 'opened' status
   - Have not been escalated yet (`escalated_at` is null)
   - Were created more than `hours_threshold` hours ago
3. **Escalate Complaints**: For each eligible complaint:
   - Sets the `escalated_at` timestamp
   - Increments the `escalation_level`
   - Assigns the complaint to the `escalate_to` user
   - Creates a notification for the assigned user
   - Logs the escalation in `complaint_history`

## Deployment

### Prerequisites

- Supabase CLI installed (`npm install -g supabase`)
- Supabase project initialized locally
- Access to your Supabase project

### Deploy the Function

```bash
# Deploy the edge function
supabase functions deploy auto-escalate-complaints

# Verify deployment
supabase functions list
```

### Set Environment Variables

The function requires the following environment variables (automatically available in Supabase Edge Functions):

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin access

These are automatically injected by Supabase when the function runs.

## Scheduling

### Set Up Cron Job

To run the function automatically every hour:

```bash
# Using Supabase CLI (if supported)
supabase functions schedule auto-escalate-complaints --cron "0 * * * *"
```

Alternatively, use an external cron service like:

1. **GitHub Actions** (recommended for development)
2. **Vercel Cron Jobs**
3. **AWS EventBridge**
4. **Google Cloud Scheduler**

### Example GitHub Actions Workflow

Create `.github/workflows/auto-escalate.yml`:

```yaml
name: Auto-Escalate Complaints

on:
  schedule:
    # Run every hour at minute 0
    - cron: '0 * * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  escalate:
    runs-on: ubuntu-latest
    steps:
      - name: Call Edge Function
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json" \
            https://your-project-ref.supabase.co/functions/v1/auto-escalate-complaints
```

## Testing

### Manual Invocation

Test the function manually using curl:

```bash
# Using anon key (for testing)
curl -X POST \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  https://your-project-ref.supabase.co/functions/v1/auto-escalate-complaints

# Using service role key (for production)
curl -X POST \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  https://your-project-ref.supabase.co/functions/v1/auto-escalate-complaints
```

### Test Locally

Run the function locally for testing:

```bash
# Start Supabase locally
supabase start

# Serve the function locally
supabase functions serve auto-escalate-complaints

# In another terminal, invoke it
curl -X POST http://localhost:54321/functions/v1/auto-escalate-complaints
```

### Create Test Data

To test the escalation logic, create test data:

```sql
-- Create a test escalation rule (escalate high priority academic complaints after 2 hours)
INSERT INTO escalation_rules (category, priority, hours_threshold, escalate_to, is_active)
VALUES (
  'academic',
  'high',
  2,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  true
);

-- Create a test complaint that should be escalated
INSERT INTO complaints (
  student_id,
  title,
  description,
  category,
  priority,
  status,
  created_at
)
VALUES (
  (SELECT id FROM users WHERE role = 'student' LIMIT 1),
  'Test Complaint for Escalation',
  'This complaint should be escalated after 2 hours',
  'academic',
  'high',
  'new',
  NOW() - INTERVAL '3 hours' -- Created 3 hours ago
);
```

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Successfully processed 2 rule(s) and escalated 3 complaint(s)",
  "results": [
    {
      "rule_id": "uuid-1",
      "complaints_escalated": 2,
      "complaint_ids": ["complaint-uuid-1", "complaint-uuid-2"]
    },
    {
      "rule_id": "uuid-2",
      "complaints_escalated": 1,
      "complaint_ids": ["complaint-uuid-3"]
    }
  ]
}
```

### No Rules Response

```json
{
  "success": true,
  "message": "No active escalation rules",
  "results": []
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Monitoring

### View Function Logs

```bash
# View recent logs
supabase functions logs auto-escalate-complaints

# Follow logs in real-time
supabase functions logs auto-escalate-complaints --follow
```

### Check Escalation History

Query the database to see escalation history:

```sql
-- View all escalated complaints
SELECT 
  c.id,
  c.title,
  c.category,
  c.priority,
  c.escalated_at,
  c.escalation_level,
  u.full_name as assigned_to_name
FROM complaints c
LEFT JOIN users u ON c.assigned_to = u.id
WHERE c.escalated_at IS NOT NULL
ORDER BY c.escalated_at DESC;

-- View escalation history entries
SELECT 
  ch.created_at,
  c.title,
  ch.action,
  ch.new_value,
  ch.details
FROM complaint_history ch
JOIN complaints c ON ch.complaint_id = c.id
WHERE ch.action = 'escalated'
ORDER BY ch.created_at DESC;
```

## Troubleshooting

### Function Not Escalating Complaints

1. **Check Active Rules**: Ensure there are active escalation rules
   ```sql
   SELECT * FROM escalation_rules WHERE is_active = true;
   ```

2. **Check Eligible Complaints**: Verify complaints match rule criteria
   ```sql
   SELECT id, title, category, priority, status, created_at, escalated_at
   FROM complaints
   WHERE status IN ('new', 'opened')
     AND escalated_at IS NULL
     AND created_at < NOW() - INTERVAL '2 hours';
   ```

3. **Check Function Logs**: Review logs for errors
   ```bash
   supabase functions logs auto-escalate-complaints
   ```

### Permission Errors

Ensure the service role key has proper permissions:
- Read access to `escalation_rules` table
- Read/write access to `complaints` table
- Write access to `notifications` table
- Write access to `complaint_history` table

## Security Considerations

1. **Service Role Key**: The function uses the service role key to bypass RLS policies. Keep this key secure.
2. **Rate Limiting**: Consider implementing rate limiting if the function is exposed publicly.
3. **Validation**: The function validates all inputs and handles errors gracefully.
4. **Logging**: All escalations are logged in the complaint history for audit purposes.

## Performance

- The function processes rules sequentially to avoid overwhelming the database
- Each complaint is updated individually with proper error handling
- Indexes on `complaints` table ensure efficient queries:
  - `idx_complaints_category`
  - `idx_complaints_priority`
  - `idx_complaints_status`
  - `idx_complaints_created_at`

## Future Enhancements

- Add email notifications for escalated complaints
- Support multiple escalation levels with different thresholds
- Add dry-run mode for testing without making changes
- Implement batch updates for better performance
- Add metrics and analytics for escalation patterns

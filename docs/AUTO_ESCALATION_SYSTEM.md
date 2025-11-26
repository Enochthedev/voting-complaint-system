# Auto-Escalation System Documentation

## Overview

The auto-escalation system automatically escalates complaints that have not been addressed within a configured time threshold. This ensures that important complaints don't fall through the cracks and are brought to the attention of appropriate personnel.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Auto-Escalation Flow                      │
└─────────────────────────────────────────────────────────────┘

1. Cron Job (Hourly)
   │
   ├─> Triggers Edge Function
   │
   └─> Edge Function: auto-escalate-complaints
       │
       ├─> Fetch Active Escalation Rules
       │   └─> escalation_rules table (WHERE is_active = true)
       │
       ├─> For Each Rule:
       │   │
       │   ├─> Find Eligible Complaints
       │   │   └─> Match: category, priority, status, age
       │   │
       │   └─> For Each Complaint:
       │       │
       │       ├─> Update Complaint
       │       │   ├─> Set escalated_at timestamp
       │       │   ├─> Increment escalation_level
       │       │   └─> Assign to escalate_to user
       │       │
       │       ├─> Create Notification
       │       │   └─> Notify assigned user
       │       │
       │       └─> Log History
       │           └─> Record escalation in complaint_history
       │
       └─> Return Results
           └─> Summary of escalations performed
```

## Database Schema

### escalation_rules Table

```sql
CREATE TABLE escalation_rules (
  id UUID PRIMARY KEY,
  category complaint_category NOT NULL,
  priority complaint_priority NOT NULL,
  hours_threshold INTEGER NOT NULL,
  escalate_to UUID NOT NULL REFERENCES users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT hours_threshold_positive CHECK (hours_threshold > 0),
  CONSTRAINT unique_active_category_priority UNIQUE (category, priority, is_active)
);
```

**Fields:**
- `category`: Complaint category this rule applies to (academic, facilities, etc.)
- `priority`: Complaint priority this rule applies to (low, medium, high, critical)
- `hours_threshold`: Number of hours before escalation triggers
- `escalate_to`: User ID (lecturer/admin) to escalate the complaint to
- `is_active`: Whether this rule is currently active

### Complaint Escalation Fields

```sql
-- In complaints table
escalated_at TIMESTAMP WITH TIME ZONE,
escalation_level INTEGER DEFAULT 0,
```

**Fields:**
- `escalated_at`: Timestamp when the complaint was first escalated
- `escalation_level`: Number of times the complaint has been escalated (increments with each escalation)

## Edge Function

### Location
`supabase/functions/auto-escalate-complaints/index.ts`

### Key Features

1. **Service Role Access**: Uses service role key to bypass RLS policies
2. **Batch Processing**: Processes all active rules in a single execution
3. **Error Handling**: Continues processing even if individual complaints fail
4. **Comprehensive Logging**: Logs all actions for debugging and monitoring
5. **Atomic Operations**: Each complaint escalation is independent

### Escalation Logic

```typescript
// Pseudo-code
for each active escalation rule:
  threshold_time = now - rule.hours_threshold
  
  complaints = find complaints where:
    - category = rule.category
    - priority = rule.priority
    - status IN ('new', 'opened')
    - created_at < threshold_time
    - escalated_at IS NULL
  
  for each complaint:
    - Set escalated_at = now
    - Increment escalation_level
    - Set assigned_to = rule.escalate_to
    - Create notification for assigned user
    - Log escalation in history
```

## Deployment

### Prerequisites

1. Supabase CLI installed
2. Supabase project configured
3. Environment variables set

### Deploy Command

```bash
# Deploy the edge function
supabase functions deploy auto-escalate-complaints

# Verify deployment
supabase functions list
```

### Environment Variables

The following variables are automatically available in Supabase Edge Functions:
- `SUPABASE_URL`: Your project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin access

## Scheduling

### Option 1: Supabase Cron (Recommended)

If your Supabase plan supports it:

```bash
supabase functions schedule auto-escalate-complaints --cron "0 * * * *"
```

### Option 2: GitHub Actions

Create `.github/workflows/auto-escalate.yml`:

```yaml
name: Auto-Escalate Complaints

on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  workflow_dispatch:

jobs:
  escalate:
    runs-on: ubuntu-latest
    steps:
      - name: Call Edge Function
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_KEY }}" \
            https://your-project.supabase.co/functions/v1/auto-escalate-complaints
```

### Option 3: External Cron Service

Use services like:
- **Vercel Cron Jobs**
- **AWS EventBridge**
- **Google Cloud Scheduler**
- **Cron-job.org**

## Configuration

### Creating Escalation Rules

#### Via SQL

```sql
-- Escalate high priority academic complaints after 24 hours
INSERT INTO escalation_rules (category, priority, hours_threshold, escalate_to, is_active)
VALUES (
  'academic',
  'high',
  24,
  (SELECT id FROM users WHERE email = 'admin@university.edu'),
  true
);

-- Escalate critical complaints of any category after 2 hours
INSERT INTO escalation_rules (category, priority, hours_threshold, escalate_to, is_active)
VALUES (
  'harassment',
  'critical',
  2,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  true
);
```

#### Via Admin UI

The admin interface (Task 10.1) provides a UI for managing escalation rules:
- Create new rules
- Edit existing rules
- Enable/disable rules
- Delete rules

### Rule Priority

When multiple rules could apply to a complaint:
- Only the first matching rule is applied
- Rules are processed in the order they're stored
- Once escalated, a complaint won't be escalated again (escalated_at is set)

### Best Practices

1. **Start Conservative**: Begin with longer thresholds (24-48 hours)
2. **Monitor Results**: Check escalation logs regularly
3. **Adjust Gradually**: Fine-tune thresholds based on actual response times
4. **Critical Priority**: Use shorter thresholds (2-4 hours) for critical complaints
5. **Category-Specific**: Different categories may need different thresholds

## Testing

### Manual Test

```bash
# 1. Create test data
npm run test:escalation-setup

# 2. Invoke function manually
curl -X POST \
  -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  https://your-project.supabase.co/functions/v1/auto-escalate-complaints

# 3. Verify results
npm run test:escalation-verify
```

### Automated Test

```bash
# Run the complete test suite
node scripts/test-auto-escalation.js
```

This script:
1. Creates a test escalation rule
2. Creates a test complaint (backdated)
3. Invokes the edge function
4. Verifies the complaint was escalated
5. Checks notification and history
6. Cleans up test data

### Local Testing

```bash
# Start Supabase locally
supabase start

# Serve the function
supabase functions serve auto-escalate-complaints

# In another terminal, invoke it
curl -X POST http://localhost:54321/functions/v1/auto-escalate-complaints
```

## Monitoring

### View Function Logs

```bash
# Recent logs
supabase functions logs auto-escalate-complaints

# Follow logs in real-time
supabase functions logs auto-escalate-complaints --follow

# Filter by time
supabase functions logs auto-escalate-complaints --since 1h
```

### Database Queries

#### Check Escalated Complaints

```sql
SELECT 
  c.id,
  c.title,
  c.category,
  c.priority,
  c.status,
  c.created_at,
  c.escalated_at,
  c.escalation_level,
  u.full_name as assigned_to
FROM complaints c
LEFT JOIN users u ON c.assigned_to = u.id
WHERE c.escalated_at IS NOT NULL
ORDER BY c.escalated_at DESC
LIMIT 20;
```

#### Check Escalation History

```sql
SELECT 
  ch.created_at,
  c.title,
  c.category,
  c.priority,
  ch.new_value as escalation_level,
  ch.details,
  u.full_name as escalated_to
FROM complaint_history ch
JOIN complaints c ON ch.complaint_id = c.id
LEFT JOIN users u ON ch.performed_by = u.id
WHERE ch.action = 'escalated'
ORDER BY ch.created_at DESC
LIMIT 20;
```

#### Check Active Rules

```sql
SELECT 
  er.id,
  er.category,
  er.priority,
  er.hours_threshold,
  u.full_name as escalate_to_name,
  er.is_active,
  er.created_at
FROM escalation_rules er
JOIN users u ON er.escalate_to = u.id
WHERE er.is_active = true
ORDER BY er.category, er.priority;
```

#### Find Complaints Eligible for Escalation

```sql
-- Check what would be escalated if function ran now
SELECT 
  c.id,
  c.title,
  c.category,
  c.priority,
  c.status,
  c.created_at,
  EXTRACT(EPOCH FROM (NOW() - c.created_at))/3600 as hours_old,
  er.hours_threshold,
  u.full_name as would_escalate_to
FROM complaints c
JOIN escalation_rules er ON 
  c.category = er.category AND 
  c.priority = er.priority AND
  er.is_active = true
LEFT JOIN users u ON er.escalate_to = u.id
WHERE c.status IN ('new', 'opened')
  AND c.escalated_at IS NULL
  AND c.created_at < NOW() - (er.hours_threshold || ' hours')::INTERVAL
ORDER BY c.created_at;
```

### Metrics to Track

1. **Escalation Rate**: Number of complaints escalated per day/week
2. **Time to Escalation**: Average time from creation to escalation
3. **Escalation by Category**: Which categories escalate most often
4. **Escalation by Priority**: Which priorities escalate most often
5. **Resolution After Escalation**: How quickly escalated complaints are resolved

## Troubleshooting

### Function Not Running

**Symptoms**: No complaints are being escalated

**Checks**:
1. Verify cron job is configured and running
2. Check function logs for errors
3. Verify function is deployed: `supabase functions list`
4. Test manual invocation

### No Complaints Escalated

**Symptoms**: Function runs but doesn't escalate anything

**Checks**:
1. Verify active escalation rules exist
2. Check if complaints match rule criteria
3. Verify complaints are old enough (past threshold)
4. Check if complaints already have escalated_at set

```sql
-- Debug query
SELECT 
  COUNT(*) as eligible_complaints,
  c.category,
  c.priority
FROM complaints c
WHERE c.status IN ('new', 'opened')
  AND c.escalated_at IS NULL
  AND c.created_at < NOW() - INTERVAL '24 hours'
GROUP BY c.category, c.priority;
```

### Permission Errors

**Symptoms**: Function fails with permission errors

**Solution**: Ensure service role key is correctly set and has proper permissions

### Notifications Not Created

**Symptoms**: Complaints escalate but users don't receive notifications

**Checks**:
1. Check notifications table for entries
2. Verify user_id in notifications matches escalate_to
3. Check RLS policies on notifications table
4. Verify real-time subscriptions are working

## Security Considerations

1. **Service Role Key**: Keep the service role key secure. It bypasses all RLS policies.
2. **Rate Limiting**: Consider rate limiting if the function endpoint is exposed publicly.
3. **Audit Trail**: All escalations are logged in complaint_history for accountability.
4. **User Validation**: Ensure escalate_to users have appropriate roles (lecturer/admin).

## Performance

### Optimization

1. **Indexes**: Ensure proper indexes exist on complaints table:
   - `idx_complaints_category`
   - `idx_complaints_priority`
   - `idx_complaints_status`
   - `idx_complaints_created_at`

2. **Batch Size**: Function processes all eligible complaints in one run
3. **Error Handling**: Individual failures don't stop the entire process

### Expected Load

- **Small System** (< 100 complaints/day): < 1 second execution time
- **Medium System** (100-1000 complaints/day): 1-5 seconds
- **Large System** (> 1000 complaints/day): 5-30 seconds

## Future Enhancements

1. **Multi-Level Escalation**: Escalate to different users at different levels
2. **Email Notifications**: Send email alerts for escalated complaints
3. **Escalation Chains**: Define escalation paths (e.g., lecturer → senior lecturer → admin)
4. **Business Hours**: Only escalate during business hours
5. **Dry Run Mode**: Test escalation logic without making changes
6. **Metrics Dashboard**: Visual dashboard for escalation analytics
7. **Custom Escalation Logic**: Support for complex escalation rules
8. **Slack/Teams Integration**: Send escalation alerts to team channels

## Related Documentation

- [Escalation Rules Management UI](./TASK_10.1_ESCALATION_RULES_PAGE_COMPLETION.md)
- [Notification System](./NOTIFICATION_SYSTEM_QUICK_REFERENCE.md)
- [Complaint History](./HISTORY_LOGGING_QUICK_REFERENCE.md)
- [Edge Functions Guide](../supabase/functions/auto-escalate-complaints/README.md)

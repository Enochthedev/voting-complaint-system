# Votes and Vote Responses Tables Summary

## Overview
This document summarizes the votes and vote_responses tables created for the Student Complaint Resolution System voting feature.

## Tables Created

### 1. votes table (Migration 012)
Stores voting polls created by lecturers/admins for gathering student feedback.

**Key Features:**
- Lecturers and admins can create voting polls
- Polls can be associated with specific complaints (optional)
- Polls can have closing dates
- Options stored as JSONB for flexibility
- Active/inactive status for poll management

**Columns:**
- `id` - UUID primary key
- `created_by` - UUID reference to users (lecturer/admin)
- `title` - Text (required, non-empty)
- `description` - Text (optional)
- `options` - JSONB array of voting options (required, non-empty)
- `is_active` - Boolean (default: true)
- `related_complaint_id` - UUID reference to complaints (optional)
- `created_at` - Timestamp
- `closes_at` - Timestamp (optional, must be in future)

**Constraints:**
- Title cannot be empty
- Options must be a non-empty JSONB array
- closes_at must be after created_at (if set)
- Foreign keys to users and complaints tables

**RLS Policies:**
- All authenticated users can view votes
- Only lecturers/admins can create votes
- Lecturers/admins can update/delete their own votes

### 2. vote_responses table (Migration 013)
Stores individual student responses to voting polls with one-vote-per-student enforcement.

**Key Features:**
- Students can vote on active polls
- One vote per student per poll (enforced by UNIQUE constraint)
- Students can update their vote (change selection)
- Lecturers can view all responses for analytics

**Columns:**
- `id` - UUID primary key
- `vote_id` - UUID reference to votes (required)
- `student_id` - UUID reference to users (required)
- `selected_option` - Text (required, non-empty)
- `created_at` - Timestamp

**Constraints:**
- selected_option cannot be empty
- UNIQUE constraint on (vote_id, student_id) - ensures one vote per student per poll
- Foreign keys to votes and users tables

**RLS Policies:**
- Students can view their own responses
- Lecturers/admins can view all responses
- Students can insert their own responses
- Students can update/delete their own responses

## Indexes Created

### votes table indexes:
- `idx_votes_created_by` - On created_by column
- `idx_votes_is_active` - On is_active column
- `idx_votes_created_at` - On created_at (descending)
- `idx_votes_closes_at` - On closes_at column
- `idx_votes_related_complaint_id` - On related_complaint_id
- `idx_votes_active_created` - Composite on (is_active, created_at)

### vote_responses table indexes:
- `idx_vote_responses_vote_id` - On vote_id column
- `idx_vote_responses_student_id` - On student_id column
- `idx_vote_responses_created_at` - On created_at (descending)
- `idx_vote_responses_vote_option` - Composite on (vote_id, selected_option) for aggregation

## Migration Files

1. **012_create_votes_table.sql** - Creates the votes table with all constraints, indexes, and RLS policies
2. **013_create_vote_responses_table.sql** - Creates the vote_responses table with all constraints, indexes, and RLS policies

## Verification Scripts

1. **verify-votes-table.sql** - Comprehensive verification for votes table
2. **verify-vote-responses-table.sql** - Comprehensive verification for vote_responses table

## How to Apply

### Using Supabase CLI (Recommended)
```bash
# Navigate to project directory
cd student-complaint-system

# Apply migrations
supabase db push

# Or apply specific migrations
psql $DATABASE_URL -f supabase/migrations/012_create_votes_table.sql
psql $DATABASE_URL -f supabase/migrations/013_create_vote_responses_table.sql
```

### Verify Installation
```bash
# Run verification scripts
psql $DATABASE_URL -f supabase/verify-votes-table.sql
psql $DATABASE_URL -f supabase/verify-vote-responses-table.sql
```

## Usage Examples

### Creating a Vote (Lecturer)
```javascript
const { data, error } = await supabase
  .from('votes')
  .insert({
    created_by: lecturerId,
    title: 'Preferred Lab Session Time',
    description: 'Help us schedule lab sessions',
    options: [
      { id: 1, text: 'Morning (8-10 AM)' },
      { id: 2, text: 'Afternoon (2-4 PM)' },
      { id: 3, text: 'Evening (6-8 PM)' }
    ],
    is_active: true,
    closes_at: '2024-12-31T23:59:59Z'
  })
```

### Casting a Vote (Student)
```javascript
const { data, error } = await supabase
  .from('vote_responses')
  .insert({
    vote_id: voteId,
    student_id: studentId,
    selected_option: 'Morning (8-10 AM)'
  })
```

### Getting Vote Results (Lecturer)
```javascript
const { data, error } = await supabase
  .from('vote_responses')
  .select('selected_option')
  .eq('vote_id', voteId)

// Aggregate results
const results = data.reduce((acc, response) => {
  acc[response.selected_option] = (acc[response.selected_option] || 0) + 1
  return acc
}, {})
```

### Checking if Student Has Voted
```javascript
const { data, error } = await supabase
  .from('vote_responses')
  .select('id')
  .eq('vote_id', voteId)
  .eq('student_id', studentId)
  .single()

const hasVoted = !!data
```

## Related Requirements

These tables implement the following acceptance criteria from the requirements document:

- **AC6: Voting System**
  - Lecturers can create voting polls with multiple options
  - Polls can be associated with specific topics or complaints
  - Students can cast votes on active polls
  - Students can only vote once per poll (enforced by UNIQUE constraint)
  - Lecturers can view voting results and statistics
  - Polls can be closed by lecturers

## Design Properties Validated

- **P6: Vote Uniqueness** - A student can vote only once per poll (enforced by UNIQUE constraint on vote_responses table)
- **P7: Role-Based Access** - RLS policies ensure students can only vote, while lecturers can create and manage polls

## Security Considerations

1. **Vote Privacy**: Students can only see their own responses, not other students' votes
2. **Vote Integrity**: UNIQUE constraint prevents duplicate votes
3. **Role Enforcement**: RLS policies ensure only lecturers/admins can create polls
4. **Cascade Deletion**: When a vote is deleted, all responses are automatically deleted
5. **Data Validation**: Constraints ensure data integrity (non-empty options, valid dates)

## Next Steps

After applying these migrations, you can:
1. Implement the voting UI components
2. Create API endpoints for vote management
3. Build analytics dashboard for vote results
4. Set up notifications for new votes
5. Implement vote closing automation

## Notes

- The `options` field uses JSONB for flexibility in storing vote options with additional metadata
- The UNIQUE constraint on (vote_id, student_id) is the core mechanism preventing duplicate votes
- Students can update their vote by using UPDATE instead of INSERT
- Consider adding a trigger to prevent voting on closed polls (closes_at < NOW())
- Consider adding a trigger to automatically set is_active=false when closes_at is reached

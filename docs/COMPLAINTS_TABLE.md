# Complaints Table Documentation

## Overview

The `complaints` table is the core table of the Student Complaint Resolution System. It stores all student complaints with comprehensive tracking, status management, and full-text search capabilities.

## Table Schema

### Table: `public.complaints`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key, unique identifier |
| `student_id` | UUID | Yes | NULL | References `public.users(id)`, null for anonymous |
| `is_anonymous` | BOOLEAN | No | `false` | Whether complaint is anonymous |
| `is_draft` | BOOLEAN | No | `false` | Whether complaint is a draft |
| `title` | TEXT | No | - | Brief title of the complaint |
| `description` | TEXT | No | - | Detailed description |
| `category` | complaint_category | No | - | Category enum value |
| `priority` | complaint_priority | No | `'medium'` | Priority level |
| `status` | complaint_status | No | `'new'` | Current status |
| `assigned_to` | UUID | Yes | NULL | References `public.users(id)` |
| `created_at` | TIMESTAMP WITH TIME ZONE | No | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | No | `NOW()` | Last update timestamp |
| `opened_at` | TIMESTAMP WITH TIME ZONE | Yes | NULL | When lecturer first opened |
| `opened_by` | UUID | Yes | NULL | References `public.users(id)` |
| `resolved_at` | TIMESTAMP WITH TIME ZONE | Yes | NULL | When complaint was resolved |
| `escalated_at` | TIMESTAMP WITH TIME ZONE | Yes | NULL | When complaint was escalated |
| `escalation_level` | INTEGER | No | `0` | Number of escalations |
| `search_vector` | tsvector | Yes | NULL | Full-text search vector |

## Enums

### complaint_category

```sql
CREATE TYPE complaint_category AS ENUM (
  'academic',
  'facilities',
  'harassment',
  'course_content',
  'administrative',
  'other'
);
```

### complaint_priority

```sql
CREATE TYPE complaint_priority AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);
```

### complaint_status

```sql
CREATE TYPE complaint_status AS ENUM (
  'draft',
  'new',
  'opened',
  'in_progress',
  'resolved',
  'closed',
  'reopened'
);
```

## Constraints

### 1. Anonymous Complaint Check

```sql
CONSTRAINT anonymous_complaint_check CHECK (
  (is_anonymous = true AND student_id IS NULL) OR
  (is_anonymous = false)
)
```

**Purpose**: Ensures anonymous complaints have no student_id to protect privacy.

**Examples**:
- ✅ Valid: `is_anonymous = true, student_id = NULL`
- ✅ Valid: `is_anonymous = false, student_id = <uuid>`
- ❌ Invalid: `is_anonymous = true, student_id = <uuid>`

### 2. Draft Status Check

```sql
CONSTRAINT draft_status_check CHECK (
  (is_draft = true AND status = 'draft') OR
  (is_draft = false AND status != 'draft')
)
```

**Purpose**: Ensures draft complaints have 'draft' status and vice versa.

**Examples**:
- ✅ Valid: `is_draft = true, status = 'draft'`
- ✅ Valid: `is_draft = false, status = 'new'`
- ❌ Invalid: `is_draft = true, status = 'new'`
- ❌ Invalid: `is_draft = false, status = 'draft'`

## Indexes

### Single Column Indexes

1. `idx_complaints_student_id` - Fast lookup by student
2. `idx_complaints_status` - Filter by status
3. `idx_complaints_category` - Filter by category
4. `idx_complaints_priority` - Filter by priority
5. `idx_complaints_assigned_to` - Find assigned complaints
6. `idx_complaints_created_at` - Sort by creation date (DESC)
7. `idx_complaints_updated_at` - Sort by update date (DESC)
8. `idx_complaints_is_draft` - Filter drafts

### Composite Indexes

1. `idx_complaints_status_created_at` - Common query pattern
2. `idx_complaints_category_priority` - Filter by category and priority
3. `idx_complaints_assigned_status` - Assigned complaints by status

### Full-Text Search Index

1. `idx_complaints_search_vector` (GIN) - Fast full-text search

## Triggers

### 1. Update Search Vector

**Trigger**: `update_complaints_search_vector`
**Function**: `update_complaint_search_vector()`
**Event**: BEFORE INSERT OR UPDATE
**Purpose**: Automatically updates the `search_vector` column for full-text search

The search vector combines:
- Title (weight 'A' - highest priority)
- Description (weight 'B' - medium priority)

### 2. Update Timestamp

**Trigger**: `update_complaints_updated_at`
**Function**: `update_updated_at_column()`
**Event**: BEFORE UPDATE
**Purpose**: Automatically updates `updated_at` timestamp on any update

## Row Level Security (RLS) Policies

### SELECT Policies

#### "Students view own complaints"
```sql
USING (
  student_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('lecturer', 'admin')
  )
)
```

**Who**: Authenticated users
**What**: Students see their own complaints; lecturers/admins see all

### INSERT Policies

#### "Students insert complaints"
```sql
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'student'
  )
)
```

**Who**: Students only
**What**: Only students can create complaints

### UPDATE Policies

#### "Students update own drafts"
```sql
USING (student_id = auth.uid() AND is_draft = true)
WITH CHECK (student_id = auth.uid() AND is_draft = true)
```

**Who**: Students
**What**: Can only update their own draft complaints

#### "Lecturers update complaints"
```sql
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('lecturer', 'admin')
  )
)
```

**Who**: Lecturers and admins
**What**: Can update any complaint (status, assignment, etc.)

### DELETE Policies

#### "Students delete own drafts"
```sql
USING (student_id = auth.uid() AND is_draft = true)
```

**Who**: Students
**What**: Can only delete their own draft complaints

## Usage Examples

### Create a New Complaint

```javascript
const { data, error } = await supabase
  .from('complaints')
  .insert({
    student_id: userId,
    is_anonymous: false,
    is_draft: false,
    title: 'Library AC not working',
    description: 'The air conditioning in the library has been broken for 3 days...',
    category: 'facilities',
    priority: 'high',
    status: 'new'
  })
  .select()
  .single();
```

### Create an Anonymous Complaint

```javascript
const { data, error } = await supabase
  .from('complaints')
  .insert({
    student_id: null, // Must be null for anonymous
    is_anonymous: true,
    is_draft: false,
    title: 'Harassment in CS101',
    description: 'I witnessed inappropriate behavior...',
    category: 'harassment',
    priority: 'critical',
    status: 'new'
  })
  .select()
  .single();
```

### Save as Draft

```javascript
const { data, error } = await supabase
  .from('complaints')
  .insert({
    student_id: userId,
    is_anonymous: false,
    is_draft: true,
    title: 'Incomplete complaint',
    description: 'Will finish later...',
    category: 'academic',
    priority: 'medium',
    status: 'draft' // Must be 'draft' when is_draft = true
  })
  .select()
  .single();
```

### Query Complaints with Filters

```javascript
const { data, error } = await supabase
  .from('complaints')
  .select('*')
  .eq('status', 'new')
  .eq('category', 'academic')
  .gte('priority', 'high')
  .order('created_at', { ascending: false })
  .range(0, 19); // Pagination: first 20 results
```

### Full-Text Search

```javascript
const { data, error } = await supabase
  .from('complaints')
  .select('*')
  .textSearch('search_vector', 'library air conditioning', {
    type: 'websearch',
    config: 'english'
  });
```

### Update Complaint Status (Lecturer)

```javascript
const { data, error } = await supabase
  .from('complaints')
  .update({
    status: 'in_progress',
    opened_at: new Date().toISOString(),
    opened_by: lecturerId
  })
  .eq('id', complaintId)
  .select()
  .single();
```

### Assign Complaint to Lecturer

```javascript
const { data, error } = await supabase
  .from('complaints')
  .update({
    assigned_to: lecturerId
  })
  .eq('id', complaintId)
  .select()
  .single();
```

### Get Student's Complaints

```javascript
// As a student (RLS automatically filters)
const { data, error } = await supabase
  .from('complaints')
  .select('*')
  .order('created_at', { ascending: false });
```

### Get All Complaints (Lecturer)

```javascript
// As a lecturer (RLS allows viewing all)
const { data, error } = await supabase
  .from('complaints')
  .select('*')
  .order('created_at', { ascending: false });
```

## Status Workflow

```
draft → new → opened → in_progress → resolved → closed
                                          ↓
                                      reopened → in_progress
```

### Status Descriptions

- **draft**: Saved but not submitted
- **new**: Submitted, awaiting lecturer review
- **opened**: Lecturer has viewed the complaint
- **in_progress**: Lecturer is actively working on it
- **resolved**: Issue has been addressed
- **closed**: Complaint is finalized
- **reopened**: Student reopened a resolved complaint

## Best Practices

### 1. Anonymous Complaints

Always set `student_id = null` when `is_anonymous = true`:

```javascript
const complaint = {
  student_id: isAnonymous ? null : userId,
  is_anonymous: isAnonymous,
  // ... other fields
};
```

### 2. Draft Management

Ensure status matches draft flag:

```javascript
const complaint = {
  is_draft: isDraft,
  status: isDraft ? 'draft' : 'new',
  // ... other fields
};
```

### 3. Status Transitions

Validate status transitions in your application:

```javascript
const validTransitions = {
  draft: ['new'],
  new: ['opened'],
  opened: ['in_progress'],
  in_progress: ['resolved'],
  resolved: ['closed', 'reopened'],
  reopened: ['in_progress'],
  closed: []
};
```

### 4. Search Optimization

The search vector is automatically maintained, but you can query it efficiently:

```javascript
// Use textSearch for full-text queries
const { data } = await supabase
  .from('complaints')
  .select('*')
  .textSearch('search_vector', searchQuery);
```

### 5. Pagination

Always paginate large result sets:

```javascript
const pageSize = 20;
const { data } = await supabase
  .from('complaints')
  .select('*')
  .range(page * pageSize, (page + 1) * pageSize - 1);
```

## Security Considerations

1. **Anonymous Privacy**: Never expose `student_id` for anonymous complaints in the UI
2. **RLS Enforcement**: Always rely on RLS policies, never bypass them
3. **Input Validation**: Validate all inputs before insertion
4. **Status Transitions**: Enforce valid status transitions in application logic
5. **Audit Trail**: Log all status changes in `complaint_history` table

## Performance Tips

1. Use indexes for filtering: status, category, priority, assigned_to
2. Use composite indexes for common query patterns
3. Limit result sets with pagination
4. Use `select()` to fetch only needed columns
5. Use full-text search for text queries instead of LIKE

## Troubleshooting

### Issue: Cannot insert anonymous complaint with student_id

**Error**: `check constraint "anonymous_complaint_check" violated`

**Solution**: Set `student_id = null` when `is_anonymous = true`

### Issue: Cannot save draft with status 'new'

**Error**: `check constraint "draft_status_check" violated`

**Solution**: Set `status = 'draft'` when `is_draft = true`

### Issue: Student cannot see their complaint

**Possible causes**:
1. Not authenticated
2. Complaint is anonymous (student_id is null)

**Solution**: Check authentication and complaint ownership

### Issue: Full-text search not working

**Possible causes**:
1. Search vector not populated
2. Wrong search syntax

**Solution**: 
- Verify trigger is working
- Use `textSearch()` method with proper syntax

## Related Tables

The complaints table is referenced by:
- `complaint_tags` - Tags for categorization
- `complaint_attachments` - File attachments
- `complaint_history` - Audit trail
- `complaint_comments` - Discussion threads
- `complaint_ratings` - Satisfaction ratings
- `feedback` - Lecturer feedback

## Migration Information

- **Migration File**: `002_create_complaints_table.sql`
- **Verification Script**: `verify-complaints-table.sql`
- **Dependencies**: `001_create_users_table_extension.sql`

## Additional Resources

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [PostgreSQL Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)

# Composite Indexes Summary

This document provides a comprehensive overview of all composite indexes in the Student Complaint Resolution System database. Composite indexes are created to optimize common query patterns and improve performance.

## What are Composite Indexes?

Composite indexes are database indexes that include multiple columns. They are particularly useful when queries frequently filter or sort by multiple columns together. The order of columns in a composite index matters - the index is most effective when queries use the leftmost columns.

## Composite Indexes by Table

### 1. complaints
**Migration**: `002_create_complaints_table.sql`

- **idx_complaints_status_created_at** `(status, created_at DESC)`
  - Purpose: Retrieve complaints filtered by status, sorted by creation date
  - Common queries: "Show all 'new' complaints, newest first"

- **idx_complaints_category_priority** `(category, priority)`
  - Purpose: Filter complaints by category and priority
  - Common queries: "Show all 'academic' complaints with 'high' priority"

- **idx_complaints_assigned_status** `(assigned_to, status)`
  - Purpose: Retrieve complaints assigned to a specific lecturer, filtered by status
  - Common queries: "Show all complaints assigned to me that are 'in_progress'"

### 2. complaint_tags
**Migration**: `003_create_complaint_tags_table.sql`

- **idx_complaint_tags_tag_complaint** `(tag_name, complaint_id)`
  - Purpose: Find all complaints with a specific tag
  - Common queries: "Show all complaints tagged with 'urgent'"

### 3. complaint_attachments
**Migrations**: `004_create_complaint_attachments_table.sql`, `015_add_additional_composite_indexes.sql`

- **idx_complaint_attachments_complaint_created** `(complaint_id, created_at DESC)`
  - Purpose: Retrieve all attachments for a complaint in chronological order
  - Common queries: "Show all files attached to this complaint, newest first"

### 4. complaint_history
**Migration**: `005_create_complaint_history_table.sql`

- **idx_complaint_history_complaint_created** `(complaint_id, created_at DESC)`
  - Purpose: Retrieve complete timeline/audit trail for a complaint
  - Common queries: "Show all actions performed on this complaint, chronologically"

### 5. complaint_comments
**Migration**: `006_create_complaint_comments_table.sql`

- **idx_complaint_comments_complaint_created** `(complaint_id, created_at ASC)`
  - Purpose: Retrieve discussion thread for a complaint in chronological order
  - Common queries: "Show all comments on this complaint, oldest first"

### 6. complaint_ratings
**Migration**: `015_add_additional_composite_indexes.sql`

- **idx_complaint_ratings_created_rating** `(created_at DESC, rating)`
  - Purpose: Time-based analytics on satisfaction ratings
  - Common queries: "Show average rating trends over time"

- **idx_complaint_ratings_student_created** `(student_id, created_at DESC)`
  - Purpose: Retrieve a student's rating history
  - Common queries: "Show all ratings submitted by this student"

### 7. complaint_templates
**Migration**: `008_create_complaint_templates_table.sql`

- **idx_complaint_templates_active_category** `(is_active, category)`
  - Purpose: Retrieve active templates for a specific category
  - Common queries: "Show all active templates for 'academic' complaints"

### 8. escalation_rules
**Migration**: `009_create_escalation_rules_table.sql`

- **idx_escalation_rules_active_category_priority** `(is_active, category, priority)`
  - Purpose: Find active escalation rules for specific complaint types
  - Common queries: "Get escalation rule for 'harassment' complaints with 'critical' priority"

### 9. feedback
**Migration**: `010_create_feedback_table.sql`

- **idx_feedback_complaint_created** `(complaint_id, created_at DESC)`
  - Purpose: Retrieve all feedback for a complaint in chronological order
  - Common queries: "Show all feedback on this complaint, newest first"

### 10. notifications
**Migration**: `011_create_notifications_table.sql`

- **idx_notifications_user_unread** `(user_id, is_read, created_at DESC)`
  - Purpose: Retrieve unread notifications for a user
  - Common queries: "Show all unread notifications for this user, newest first"

- **idx_notifications_user_type** `(user_id, type, created_at DESC)`
  - Purpose: Filter notifications by type for a user
  - Common queries: "Show all 'complaint_opened' notifications for this user"

### 11. votes
**Migration**: `012_create_votes_table.sql`

- **idx_votes_active_created** `(is_active, created_at DESC)`
  - Purpose: Retrieve active voting polls
  - Common queries: "Show all active polls, newest first"

### 12. vote_responses
**Migration**: `013_create_vote_responses_table.sql`

- **idx_vote_responses_vote_option** `(vote_id, selected_option)`
  - Purpose: Aggregate voting results by option
  - Common queries: "Count how many students selected each option for this poll"

## Performance Benefits

Composite indexes provide significant performance improvements for:

1. **Filtered Queries**: When filtering by multiple columns (e.g., status AND created_at)
2. **Sorted Results**: When sorting by columns included in the index
3. **Join Operations**: When joining tables on indexed columns
4. **Aggregations**: When grouping or counting by indexed columns

## Index Maintenance

- Indexes are automatically maintained by PostgreSQL
- They are updated when data is inserted, updated, or deleted
- The `IF NOT EXISTS` clause prevents errors if indexes already exist
- All indexes use appropriate sort orders (ASC/DESC) based on common query patterns

## Query Optimization Tips

To take full advantage of these composite indexes:

1. **Use leftmost columns**: Queries should filter/sort by the leftmost columns in the index
2. **Match index order**: Sort order in queries should match the index definition
3. **Avoid functions on indexed columns**: Use `WHERE created_at > '2024-01-01'` instead of `WHERE DATE(created_at) = '2024-01-01'`
4. **Monitor query performance**: Use `EXPLAIN ANALYZE` to verify indexes are being used

## Related Documentation

- See `INDEX_SUMMARY.md` for single-column indexes
- See individual migration files for detailed index definitions
- See design document for query patterns and performance requirements

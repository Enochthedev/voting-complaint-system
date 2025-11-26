# History Logging Architecture

## Overview

This document provides a visual representation of how history logging works in the Student Complaint Resolution System.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     COMPLAINT ACTIONS                                │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
        ┌────────────────────────┴────────────────────────┐
        │                                                  │
        ▼                                                  ▼
┌──────────────────┐                            ┌──────────────────┐
│  DATABASE        │                            │  API             │
│  TRIGGERS        │                            │  FUNCTIONS       │
│  (Automatic)     │                            │  (Manual)        │
└──────────────────┘                            └──────────────────┘
        │                                                  │
        ├─ Complaint Creation                             ├─ Reopening
        ├─ Status Changes                                 ├─ Rating
        ├─ Assignment/Reassignment                        └─ Tag Addition
        ├─ Feedback Addition ✨ NEW
        ├─ Comment Addition ✨ NEW
        ├─ Comment Edit ✨ NEW
        └─ Comment Deletion ✨ NEW
        │                                                  │
        └────────────────────────┬────────────────────────┘
                                 ▼
                    ┌────────────────────────┐
                    │  complaint_history     │
                    │  TABLE                 │
                    │  (Immutable)           │
                    └────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Timeline UI           │
                    │  Component             │
                    └────────────────────────┘
```

## Data Flow

### 1. Automatic Logging (Database Triggers)

```
User Action (e.g., Add Comment)
        ↓
INSERT INTO complaint_comments
        ↓
TRIGGER: log_comment_addition_trigger
        ↓
FUNCTION: log_comment_addition()
        ↓
INSERT INTO complaint_history
        ↓
History Entry Created ✅
```

### 2. Manual Logging (API Functions)

```
User Action (e.g., Reopen Complaint)
        ↓
API Call: reopenComplaint()
        ↓
UPDATE complaints SET status = 'reopened'
        ↓
INSERT INTO complaint_history (manual)
        ↓
History Entry Created ✅
```

## Trigger Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLAINTS TABLE                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  INSERT (new complaint)                                   │  │
│  │    ↓                                                      │  │
│  │  log_complaint_creation_trigger                          │  │
│  │    ↓                                                      │  │
│  │  complaint_history: action = 'created'                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  UPDATE (status changed)                                  │  │
│  │    ↓                                                      │  │
│  │  complaint_status_change_trigger                         │  │
│  │    ↓                                                      │  │
│  │  complaint_history: action = 'status_changed'            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  UPDATE (assigned_to changed)                            │  │
│  │    ↓                                                      │  │
│  │  log_complaint_assignment_trigger                        │  │
│  │    ↓                                                      │  │
│  │  complaint_history: action = 'assigned'/'reassigned'     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    FEEDBACK TABLE                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  INSERT (new feedback) ✨ NEW                            │  │
│  │    ↓                                                      │  │
│  │  log_feedback_addition_trigger                           │  │
│  │    ↓                                                      │  │
│  │  complaint_history: action = 'feedback_added'            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                COMPLAINT_COMMENTS TABLE                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  INSERT (new comment) ✨ NEW                             │  │
│  │    ↓                                                      │  │
│  │  log_comment_addition_trigger                            │  │
│  │    ↓                                                      │  │
│  │  complaint_history: action = 'comment_added'             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  UPDATE (comment edited) ✨ NEW                          │  │
│  │    ↓                                                      │  │
│  │  log_comment_edit_trigger                                │  │
│  │    ↓                                                      │  │
│  │  complaint_history: action = 'comment_added'             │  │
│  │                     details.action_type = 'edited'       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  DELETE (comment deleted) ✨ NEW                         │  │
│  │    ↓                                                      │  │
│  │  log_comment_deletion_trigger                            │  │
│  │    ↓                                                      │  │
│  │  complaint_history: action = 'comment_added'             │  │
│  │                     details.action_type = 'deleted'      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## History Entry Structure

```json
{
  "id": "uuid",
  "complaint_id": "uuid",
  "action": "comment_added",
  "old_value": "Previous comment text (first 100 chars)",
  "new_value": "New comment text (first 100 chars)",
  "performed_by": "user-uuid",
  "details": {
    "comment_id": "uuid",
    "is_internal": false,
    "action_type": "edited",
    "timestamp": "2025-11-25T10:30:00Z"
  },
  "created_at": "2025-11-25T10:30:00Z"
}
```

## Action Types and Their Sources

| Action | Source | Trigger/Function | Migration |
|--------|--------|------------------|-----------|
| `created` | complaints table | `log_complaint_creation_trigger` | 017 |
| `status_changed` | complaints table | `complaint_status_change_trigger` | 017 |
| `assigned` | complaints table | `log_complaint_assignment_trigger` | 017 |
| `reassigned` | complaints table | `log_complaint_assignment_trigger` | 017 |
| `feedback_added` | feedback table | `log_feedback_addition_trigger` | 037 ✨ |
| `comment_added` | complaint_comments table | `log_comment_addition_trigger` | 037 ✨ |
| `comment_added` (edit) | complaint_comments table | `log_comment_edit_trigger` | 037 ✨ |
| `comment_added` (delete) | complaint_comments table | `log_comment_deletion_trigger` | 037 ✨ |
| `reopened` | API function | `reopenComplaint()` | N/A |
| `rated` | API function | `submitRating()` | N/A |
| `tags_added` | API function | `bulkAddTags()` | N/A |
| `escalated` | Future | Not yet implemented | TBD |

## Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│                  ROW LEVEL SECURITY (RLS)                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SELECT Policy: "Users view history on accessible complaints"   │
│                                                                  │
│  Students:                                                       │
│    ✅ Can view history for their own complaints                 │
│    ❌ Cannot view history for other students' complaints        │
│                                                                  │
│  Lecturers/Admins:                                              │
│    ✅ Can view history for all complaints                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  INSERT Policy: "System inserts history records"                │
│                                                                  │
│  All authenticated users:                                        │
│    ✅ Can insert history records (via triggers/API)             │
│    ⚠️  Direct INSERT from client should be avoided              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  UPDATE/DELETE Policies: NONE                                   │
│                                                                  │
│  All users:                                                      │
│    ❌ Cannot update history records (immutable)                 │
│    ❌ Cannot delete history records (immutable)                 │
└─────────────────────────────────────────────────────────────────┘
```

## Timeline Display Flow

```
User Opens Complaint Detail Page
        ↓
Fetch complaint with history:
  SELECT * FROM complaints
  JOIN complaint_history
  WHERE complaint_id = ?
        ↓
Sort history by created_at DESC
        ↓
For each history entry:
  - Determine icon based on action
  - Format timestamp
  - Get user who performed action
  - Display old_value → new_value
  - Show additional details
        ↓
Render Timeline Component
        ↓
User sees complete audit trail ✅
```

## Benefits of This Architecture

### 1. Automatic Logging
- ✅ No manual code needed for most actions
- ✅ Cannot be bypassed
- ✅ Consistent across all entry points

### 2. Immutability
- ✅ History cannot be changed
- ✅ Reliable audit trail
- ✅ Meets compliance requirements

### 3. Transparency
- ✅ Users see full complaint lifecycle
- ✅ Clear accountability
- ✅ Easy debugging

### 4. Performance
- ✅ Indexed for fast queries
- ✅ Efficient timeline display
- ✅ Minimal overhead

### 5. Flexibility
- ✅ Hybrid approach (triggers + API)
- ✅ JSONB details for extensibility
- ✅ Easy to add new action types

## Related Documentation

- [Complete History Logging Documentation](./HISTORY_LOGGING_COMPLETE.md)
- [Quick Reference Guide](./HISTORY_LOGGING_QUICK_REFERENCE.md)
- [Implementation Summary](../HISTORY_LOGGING_IMPLEMENTATION_SUMMARY.md)
- [Timeline Component](./TASK_9.2_TIMELINE_COMPONENT_COMPLETION.md)

---

**Status**: ✅ Complete
**Last Updated**: November 25, 2025

# Internal Notes - Quick Reference Guide

## Overview

Internal notes allow lecturers and admins to add private comments to complaints that are only visible to other staff members. Students cannot see these notes.

## Quick Start

### Adding an Internal Note

1. Navigate to a complaint detail page
2. Scroll to the "Discussion" section
3. Type your note in the comment textarea
4. ✅ Check the "Internal note" checkbox
5. Click "Post"

### Using the "Add Internal Note" Button

1. Click the "Add Internal Note" button in the Actions section
2. Page automatically scrolls to the comment input
3. Check the "Internal note" checkbox
4. Type your note and submit

## Key Features

### ✅ Role-Based Visibility

| User Role | Can See Internal Notes? | Can Add Internal Notes? |
|-----------|------------------------|------------------------|
| Student   | ❌ No                  | ❌ No                  |
| Lecturer  | ✅ Yes                 | ✅ Yes                 |
| Admin     | ✅ Yes                 | ✅ Yes                 |

### ✅ Visual Indicators

- Internal notes display with a yellow "Internal" badge
- Info alert appears when internal checkbox is checked
- Comment count reflects only visible comments for each role

### ✅ Chronological Order

- All comments (public and internal) are sorted by creation time
- Internal notes appear in the timeline where they were created
- Students see gaps in the timeline where internal notes exist

## Common Use Cases

### 1. Staff Coordination
```
Internal note: "Waiting for department head approval before responding. 
Will update by EOD."
```

### 2. Escalation Discussion
```
Internal note: "This complaint requires legal review. Holding response 
until cleared by legal team."
```

### 3. Resource Allocation
```
Internal note: "Budget approved for emergency repair. Can proceed with 
solution immediately."
```

### 4. Pattern Recognition
```
Internal note: "Third complaint about this AC unit this month. Need to 
schedule full HVAC inspection."
```

### 5. Sensitive Information
```
Internal note: "Student has documented disability accommodation. Handle 
with extra care and flexibility."
```

## Best Practices

### ✅ DO:
- Use internal notes for staff coordination
- Document sensitive information internally
- Track patterns and recurring issues
- Note budget approvals and resource allocation
- Record escalation decisions

### ❌ DON'T:
- Use internal notes for information students should see
- Include personal opinions about students
- Store confidential student data without proper authorization
- Use internal notes to avoid transparency
- Forget to follow up with public comments when appropriate

## UI Components

### Comment Input with Internal Toggle

```
┌─────────────────────────────────────────────┐
│ Add Comment                                 │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Write your comment here...              │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ☑️ Internal note (visible only to          │
│    lecturers and admins)                    │
│                                             │
│                          [Cancel]  [Post]   │
└─────────────────────────────────────────────┘
```

### Info Alert (when internal is checked)

```
┌─────────────────────────────────────────────┐
│ ℹ️  This internal note will only be visible │
│    to lecturers and admins.                 │
└─────────────────────────────────────────────┘
```

### Internal Note Display

```
┌─────────────────────────────────────────────┐
│ 👤 Dr. Sarah Smith          [Internal]      │
│    2 hours ago                              │
│                                             │
│ Internal note: This is a recurring issue.   │
│ We need to schedule a full HVAC system      │
│ inspection for all lecture halls.           │
└─────────────────────────────────────────────┘
```

## Keyboard Shortcuts

- `Ctrl+Enter` or `Cmd+Enter` - Submit comment
- `Escape` - Cancel editing (if in edit mode)

## Technical Details

### Database Field
- Field: `is_internal` (boolean)
- Default: `false`
- Required: Yes

### RLS Policy (Phase 12)
```sql
-- Students can only see non-internal comments
-- Lecturers and admins can see all comments
CREATE POLICY "View comments"
ON complaint_comments FOR SELECT
USING (
  is_internal = false OR 
  auth.jwt()->>'role' IN ('lecturer', 'admin')
);
```

### Component Props

**CommentInput:**
```typescript
<CommentInput
  showInternalToggle={userRole === 'lecturer' || userRole === 'admin'}
  onSubmit={async (comment, isInternal) => {
    // Handle submission with isInternal flag
  }}
/>
```

## Troubleshooting

### Issue: Internal toggle not visible
**Solution:** Verify you're logged in as a lecturer or admin

### Issue: Students can see internal notes
**Solution:** Check that filtering logic is applied in CommentsSection component

### Issue: Comment count includes internal notes for students
**Solution:** Ensure visibleComments is used instead of localComments for count

### Issue: Internal notes not sorted correctly
**Solution:** Verify chronological sorting is applied after filtering

## Security Considerations

1. **Access Control:** Internal notes are filtered client-side AND server-side (Phase 12)
2. **RLS Policies:** Database enforces visibility rules
3. **Audit Trail:** All internal notes are logged in complaint history
4. **No Deletion:** Internal notes cannot be deleted (only edited within time limit)

## Related Documentation

- Full Demo: `src/components/complaints/__tests__/internal-notes-demo.md`
- Tests: `src/components/complaints/__tests__/internal-notes.test.tsx`
- Completion Summary: `docs/TASK_5.2_INTERNAL_NOTES_COMPLETION.md`
- Design Document: `.kiro/specs/student-complaint-system/design.md`

## Support

For questions or issues with internal notes:
1. Check this quick reference guide
2. Review the full demo documentation
3. Check the test file for examples
4. Contact system administrator

---

**Last Updated:** November 20, 2024  
**Feature Status:** ✅ UI Complete, ⏳ Database Integration in Phase 12

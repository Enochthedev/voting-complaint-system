# Internal Notes Feature - Visual Demo

## Overview

The internal notes feature allows lecturers and admins to add private notes to complaints that are only visible to other lecturers and admins. Students cannot see these internal notes.

## Feature Requirements

**Validates: Requirements AC15 - Follow-up and Discussion System**

- Lecturers can add internal notes to complaints
- Internal notes are marked with an "Internal" badge
- Students cannot see internal notes
- Lecturers and admins can see all comments including internal notes
- Internal notes are displayed in chronological order with regular comments

## UI Components

### 1. Comment Input with Internal Toggle

When a lecturer or admin views a complaint, they see a checkbox to mark their comment as internal:

```
┌─────────────────────────────────────────────────────────┐
│ Add Comment                                             │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Write your comment here...                          │ │
│ │                                                     │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│ Minimum 1 characters • Press Ctrl+Enter to submit  0/2000│
│                                                         │
│ ☐ Internal note (visible only to lecturers and admins) │
│                                                         │
│                                    [Cancel]  [Post]     │
└─────────────────────────────────────────────────────────┘
```

### 2. Internal Note Info Alert

When the internal checkbox is checked, an info alert appears:

```
┌─────────────────────────────────────────────────────────┐
│ ℹ️  This internal note will only be visible to         │
│    lecturers and admins.                                │
└─────────────────────────────────────────────────────────┘
```

### 3. Comments Display - Lecturer View

Lecturers and admins see all comments including internal notes with badges:

```
Discussion (5)

┌─────────────────────────────────────────────────────────┐
│ 👤 Dr. Sarah Smith                                      │
│    2 hours ago                                          │
│                                                         │
│ Thank you for reporting this issue. I have contacted   │
│ the facilities management team.                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 👤 Dr. Sarah Smith                    [Internal]        │
│    2 hours ago                                          │
│                                                         │
│ Internal note: This is a recurring issue. We need to   │
│ schedule a full HVAC system inspection.                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 👤 John Doe                                             │
│    1 hour ago                                           │
│                                                         │
│ Thank you for the quick response!                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 👤 Admin Robert Brown                 [Internal]        │
│    30 minutes ago                                       │
│                                                         │
│ Internal note: Budget approved for emergency HVAC      │
│ repairs. Prioritize this complaint.                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 👤 Dr. Sarah Smith                                      │
│    10 minutes ago                                       │
│                                                         │
│ Update: The facilities team has ordered replacement    │
│ parts. They expect to complete the repair by Friday.    │
└─────────────────────────────────────────────────────────┘
```

### 4. Comments Display - Student View

Students only see public comments (internal notes are filtered out):

```
Discussion (3)

┌─────────────────────────────────────────────────────────┐
│ 👤 Dr. Sarah Smith                                      │
│    2 hours ago                                          │
│                                                         │
│ Thank you for reporting this issue. I have contacted   │
│ the facilities management team.                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 👤 John Doe                                             │
│    1 hour ago                                           │
│                                                         │
│ Thank you for the quick response!                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 👤 Dr. Sarah Smith                                      │
│    10 minutes ago                                       │
│                                                         │
│ Update: The facilities team has ordered replacement    │
│ parts. They expect to complete the repair by Friday.    │
└─────────────────────────────────────────────────────────┘
```

Notice: The 2 internal notes are NOT visible to students!

## Action Buttons

### Lecturer/Admin Actions

```
┌─────────────────────────────────────────────────────────┐
│ Actions                                                 │
├─────────────────────────────────────────────────────────┤
│ [Change Status ▼]  [Assign]  [Add Internal Note]       │
└─────────────────────────────────────────────────────────┘
```

### Student Actions

```
┌─────────────────────────────────────────────────────────┐
│ Actions                                                 │
├─────────────────────────────────────────────────────────┤
│ [Add Comment]  [Reopen Complaint]  [Rate Resolution]   │
└─────────────────────────────────────────────────────────┘
```

Notice: Students do NOT see the "Add Internal Note" button!

## User Flows

### Flow 1: Lecturer Adds Internal Note

1. Lecturer views complaint detail page
2. Scrolls to comments section
3. Types a note in the comment textarea
4. Checks the "Internal note" checkbox
5. Info alert appears: "This internal note will only be visible to lecturers and admins"
6. Clicks "Post" button
7. Comment is added with "Internal" badge
8. Only lecturers and admins can see this comment

### Flow 2: Lecturer Adds Public Comment

1. Lecturer views complaint detail page
2. Scrolls to comments section
3. Types a comment in the textarea
4. Leaves the "Internal note" checkbox unchecked
5. Clicks "Post" button
6. Comment is added without "Internal" badge
7. Everyone (students, lecturers, admins) can see this comment

### Flow 3: Student Views Comments

1. Student views their complaint detail page
2. Scrolls to comments section
3. Sees only public comments
4. Internal notes are automatically filtered out
5. Comment count shows only visible comments (e.g., "Discussion (3)" instead of "Discussion (5)")

### Flow 4: Lecturer Clicks "Add Internal Note" Button

1. Lecturer views complaint detail page
2. Clicks "Add Internal Note" button in the Actions section
3. Page scrolls to the comments section
4. Comment textarea receives focus
5. Lecturer can check the "Internal note" checkbox to make it internal

## Technical Implementation

### Component: CommentInput

**Props:**
- `showInternalToggle: boolean` - Shows/hides the internal checkbox
- `onSubmit: (comment: string, isInternal: boolean) => Promise<void>` - Callback with internal flag

**Features:**
- Checkbox to mark comment as internal
- Info alert when internal is selected
- Validation and character count
- Loading states

### Component: CommentsSection

**Filtering Logic:**
```typescript
const visibleComments = React.useMemo(() => {
  if (!localComments) return [];
  
  // Filter out internal notes for students
  const filtered = localComments.filter((comment) => {
    // Lecturers and admins can see all comments
    if (userRole === 'lecturer' || userRole === 'admin') {
      return true;
    }
    // Students can only see non-internal comments
    return !comment.is_internal;
  });
  
  // Sort in chronological order (oldest first)
  return filtered.sort((a, b) => {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}, [localComments, userRole]);
```

**Display:**
- Shows "Internal" badge for internal notes
- Filters comments based on user role
- Maintains chronological order

### Database Schema

**Table: complaint_comments**
```sql
CREATE TABLE complaint_comments (
  id uuid PRIMARY KEY,
  complaint_id uuid REFERENCES complaints(id),
  user_id uuid REFERENCES users(id),
  comment text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
```

### RLS Policies (Phase 12)

**Policy: View Comments**
```sql
-- Students can view non-internal comments on their complaints
-- Lecturers and admins can view all comments
CREATE POLICY "View comments on accessible complaints"
ON complaint_comments FOR SELECT
TO authenticated
USING (
  complaint_id IN (
    SELECT id FROM complaints
    WHERE student_id = auth.uid() OR auth.jwt()->>'role' IN ('lecturer', 'admin')
  ) AND (
    is_internal = false OR 
    auth.jwt()->>'role' IN ('lecturer', 'admin')
  )
);
```

**Policy: Add Comments**
```sql
-- Users can add comments to accessible complaints
-- Only lecturers/admins can create internal notes
CREATE POLICY "Add comments to accessible complaints"
ON complaint_comments FOR INSERT
TO authenticated
WITH CHECK (
  complaint_id IN (
    SELECT id FROM complaints
    WHERE student_id = auth.uid() OR auth.jwt()->>'role' IN ('lecturer', 'admin')
  ) AND (
    is_internal = false OR 
    auth.jwt()->>'role' IN ('lecturer', 'admin')
  )
);
```

## Testing

### Unit Tests

See `internal-notes.test.tsx` for comprehensive test coverage:

1. ✅ Internal toggle visibility based on user role
2. ✅ Internal flag submission
3. ✅ Info alert display
4. ✅ Comment filtering for students
5. ✅ Comment visibility for lecturers/admins
6. ✅ Internal badge display
7. ✅ Chronological ordering
8. ✅ Action button visibility

### Manual Testing Checklist

- [ ] Lecturer can see internal toggle checkbox
- [ ] Student cannot see internal toggle checkbox
- [ ] Checking internal shows info alert
- [ ] Internal comments show "Internal" badge
- [ ] Students cannot see internal comments
- [ ] Lecturers can see all comments including internal
- [ ] Admins can see all comments including internal
- [ ] Comment count reflects visible comments only
- [ ] Comments maintain chronological order
- [ ] "Add Internal Note" button only visible to lecturers/admins
- [ ] Clicking "Add Internal Note" scrolls to comments

## Phase 12 Integration

In Phase 12, the following will be implemented:

1. **Database Integration:**
   - Save `is_internal` flag to Supabase
   - Implement RLS policies to enforce visibility rules
   - Create database triggers for notifications

2. **Real-time Updates:**
   - Subscribe to comment changes
   - Update UI when new comments are added
   - Show toast notifications for new comments

3. **Notifications:**
   - Create notifications when comments are added
   - Skip notifications for internal notes to students
   - Notify assigned lecturer of internal notes

4. **History Logging:**
   - Log comment additions in complaint_history
   - Track internal note additions separately

## Benefits

1. **Privacy:** Lecturers can discuss sensitive information without students seeing it
2. **Collaboration:** Staff can coordinate responses internally
3. **Documentation:** Internal notes provide audit trail for staff actions
4. **Flexibility:** Lecturers can choose when to communicate publicly vs. internally
5. **Transparency:** Students see all public communication clearly

## Use Cases

### Use Case 1: Coordinating Response
Lecturer adds internal note: "Need to check with department head before responding. Will update by EOD."

### Use Case 2: Escalation Discussion
Admin adds internal note: "This complaint requires legal review. Holding response until cleared."

### Use Case 3: Resource Allocation
Lecturer adds internal note: "Budget approved for this repair. Can proceed with solution."

### Use Case 4: Pattern Recognition
Lecturer adds internal note: "Third complaint about this issue this month. Need systemic fix."

### Use Case 5: Sensitive Information
Lecturer adds internal note: "Student has documented disability accommodation. Handle with care."

## Conclusion

The internal notes feature provides a secure way for staff to collaborate on complaint resolution while maintaining appropriate boundaries with students. The feature is fully implemented in the UI and ready for database integration in Phase 12.

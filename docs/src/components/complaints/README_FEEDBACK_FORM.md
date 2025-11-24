# Feedback Form Implementation

## Overview

The feedback form system allows lecturers to provide detailed feedback on student complaints. This implementation follows the UI-first development approach with mock data, ready for Phase 12 API integration.

## Components

### 1. FeedbackForm (`feedback-form.tsx`)

A form component for lecturers to write and submit feedback on complaints.

**Key Features:**
- Rich text editor with formatting capabilities
- Character count validation (10-5000 characters)
- Real-time validation with error messages
- Loading states during submission
- Success confirmation messages
- Edit mode for existing feedback
- 24-hour edit window enforcement
- Cancel functionality

**Props:**
```typescript
interface FeedbackFormProps {
  complaintId: string;           // Required: ID of the complaint
  onSubmit?: (content: string) => Promise<void>;  // Optional: Submit callback
  onCancel?: () => void;         // Optional: Cancel callback
  existingFeedback?: Feedback;   // Optional: For editing existing feedback
  isEditing?: boolean;           // Optional: Edit mode flag
}
```

**Usage:**
```tsx
// Add new feedback
<FeedbackForm
  complaintId="complaint-123"
  onSubmit={async (content) => {
    await submitFeedback(content);
  }}
  onCancel={() => setShowForm(false)}
/>

// Edit existing feedback
<FeedbackForm
  complaintId="complaint-123"
  existingFeedback={feedback}
  isEditing={true}
  onSubmit={async (content) => {
    await updateFeedback(content);
  }}
  onCancel={() => setEditMode(false)}
/>
```

### 2. FeedbackDisplay (`feedback-display.tsx`)

A component to display all feedback entries for a complaint with add/edit capabilities.

**Key Features:**
- Display feedback in chronological order
- Show lecturer information with avatars
- Relative timestamps (e.g., "2 hours ago")
- Edit indicator for modified feedback
- Edit button for own feedback (within 24 hours)
- Add feedback button for lecturers
- Empty state when no feedback exists
- Inline editing mode
- Role-based access control

**Props:**
```typescript
interface FeedbackDisplayProps {
  complaintId: string;           // Required: ID of the complaint
  feedback?: FeedbackWithUser[]; // Optional: Array of feedback entries
  userRole?: 'student' | 'lecturer' | 'admin';  // Optional: Current user role
  currentUserId?: string;        // Optional: Current user ID
  onAddFeedback?: () => void;    // Optional: Add feedback callback
  onEditFeedback?: (feedbackId: string) => void;  // Optional: Edit callback
}
```

**Usage:**
```tsx
<FeedbackDisplay
  complaintId="complaint-123"
  feedback={feedbackList}
  userRole="lecturer"
  currentUserId="lecturer-456"
  onAddFeedback={() => console.log('Adding feedback')}
  onEditFeedback={(id) => console.log('Editing feedback:', id)}
/>
```

## Validation Rules

1. **Content Required**: Feedback cannot be empty (HTML stripped for validation)
2. **Minimum Length**: At least 10 characters of actual text content
3. **Maximum Length**: No more than 5000 characters of text content
4. **Edit Time Limit**: Feedback can only be edited within 24 hours of creation

## UI States

### Empty State
- Displayed when no feedback exists
- Shows empty state icon and message
- "Add Feedback" button for lecturers
- Clean, centered layout

### Add Feedback Mode
- Rich text editor with formatting toolbar
- Character counter with color coding:
  - Orange: Below minimum (< 10 chars)
  - Red: Above maximum (> 5000 chars)
  - Gray: Valid range
- Info alert about student notification
- Submit and Cancel buttons
- Form validation on submit

### Display Feedback
- Lecturer avatar (first letter of name)
- Lecturer full name
- Relative timestamp (e.g., "2 hours ago")
- Formatted feedback content (HTML rendered)
- "Edited" indicator if modified
- Edit button (if applicable)
- Time remaining for edit window

### Edit Feedback Mode
- Pre-filled with existing content
- Same editor as add mode
- "Update Feedback" button
- Cancel button
- Yellow notice about 24-hour edit limit

### Loading State
- Disabled form during submission
- Loading spinner on submit button
- "Sending..." or "Updating..." text
- Disabled cancel button

### Success State
- Green success alert with checkmark
- Confirmation message
- Auto-close after 2 seconds
- Form resets

### Error State
- Red error alert with warning icon
- Error message
- Form remains open for retry
- Submit button re-enabled

## Integration with Complaint Detail View

Add the feedback display to the complaint detail page:

```tsx
import { FeedbackDisplay } from '@/components/complaints';

function ComplaintDetailPage({ complaintId }) {
  // Get from auth context
  const userRole = useAuth().user?.role;
  const currentUserId = useAuth().user?.id;
  
  // Fetch feedback (Phase 12)
  const [feedback, setFeedback] = useState([]);

  return (
    <div className="space-y-6">
      {/* Complaint header, description, attachments, etc. */}
      
      {/* Feedback Section */}
      <FeedbackDisplay
        complaintId={complaintId}
        feedback={feedback}
        userRole={userRole}
        currentUserId={currentUserId}
      />
      
      {/* Comments, timeline, etc. */}
    </div>
  );
}
```

## Phase 12 API Integration

When implementing real API integration:

### 1. Submit New Feedback

```typescript
const handleSubmitFeedback = async (content: string) => {
  // Insert feedback
  const { data: feedback, error } = await supabase
    .from('feedback')
    .insert({
      complaint_id: complaintId,
      lecturer_id: currentUser.id,
      content: content,
    })
    .select()
    .single();

  if (error) throw error;

  // Create notification for student
  await supabase.from('notifications').insert({
    user_id: complaint.student_id,
    type: 'feedback_received',
    title: 'New Feedback Received',
    message: `A lecturer has provided feedback on your complaint: "${complaint.title}"`,
    related_id: complaintId,
    is_read: false,
  });

  // Log in history
  await supabase.from('complaint_history').insert({
    complaint_id: complaintId,
    action: 'feedback_added',
    performed_by: currentUser.id,
    new_value: feedback.id,
  });

  return feedback;
};
```

### 2. Update Existing Feedback

```typescript
const handleUpdateFeedback = async (feedbackId: string, content: string) => {
  // Check if within 24-hour edit window
  const { data: existing } = await supabase
    .from('feedback')
    .select('created_at, lecturer_id')
    .eq('id', feedbackId)
    .single();

  const hoursSinceCreation = 
    (Date.now() - new Date(existing.created_at).getTime()) / (1000 * 60 * 60);

  if (hoursSinceCreation > 24) {
    throw new Error('Edit window has expired (24 hours)');
  }

  if (existing.lecturer_id !== currentUser.id) {
    throw new Error('You can only edit your own feedback');
  }

  // Update feedback
  const { data, error } = await supabase
    .from('feedback')
    .update({
      content: content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', feedbackId)
    .select()
    .single();

  if (error) throw error;

  return data;
};
```

### 3. Fetch Feedback for Complaint

```typescript
const fetchFeedback = async (complaintId: string) => {
  const { data, error } = await supabase
    .from('feedback')
    .select(`
      *,
      lecturer:users!lecturer_id(*)
    `)
    .eq('complaint_id', complaintId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data;
};
```

### 4. Real-time Feedback Updates

```typescript
useEffect(() => {
  // Subscribe to feedback changes
  const channel = supabase
    .channel(`feedback:${complaintId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'feedback',
        filter: `complaint_id=eq.${complaintId}`,
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          // Add new feedback to list
          setFeedback((prev) => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          // Update existing feedback
          setFeedback((prev) =>
            prev.map((f) => (f.id === payload.new.id ? payload.new : f))
          );
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [complaintId]);
```

## Database Schema

The feedback table structure:

```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  lecturer_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_feedback_complaint_id ON feedback(complaint_id);
CREATE INDEX idx_feedback_lecturer_id ON feedback(lecturer_id);
CREATE INDEX idx_feedback_created_at ON feedback(created_at);
```

## RLS Policies

```sql
-- Students can view feedback on their complaints
CREATE POLICY "Students view feedback on own complaints"
ON feedback FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM complaints
    WHERE complaints.id = feedback.complaint_id
    AND (complaints.student_id = auth.uid() OR auth.jwt()->>'role' IN ('lecturer', 'admin'))
  )
);

-- Lecturers can insert feedback
CREATE POLICY "Lecturers insert feedback"
ON feedback FOR INSERT
TO authenticated
WITH CHECK (auth.jwt()->>'role' IN ('lecturer', 'admin'));

-- Lecturers can update their own feedback within 24 hours
CREATE POLICY "Lecturers update own feedback"
ON feedback FOR UPDATE
TO authenticated
USING (
  lecturer_id = auth.uid() AND
  auth.jwt()->>'role' IN ('lecturer', 'admin') AND
  created_at > NOW() - INTERVAL '24 hours'
);
```

## Accessibility

- Proper ARIA labels on all form elements
- Keyboard navigation support (Tab, Enter, Escape)
- Focus management (auto-focus on editor when form opens)
- Screen reader announcements for success/error states
- Color contrast compliance (WCAG 2.1 AA)
- Semantic HTML structure

## Responsive Design

- Mobile-friendly layout (stacks on small screens)
- Touch-friendly buttons (minimum 44x44px)
- Responsive text editor
- Adaptive spacing and padding
- Readable font sizes on all devices

## Testing

### Manual Testing Checklist

- [ ] Form validation works correctly
- [ ] Character count updates in real-time
- [ ] Submit button disabled when content is invalid
- [ ] Loading state displays during submission
- [ ] Success message shows after submission
- [ ] Error handling works properly
- [ ] Edit mode pre-fills content correctly
- [ ] Edit time limit enforced (24 hours)
- [ ] Cancel button works and resets form
- [ ] Empty state displays correctly
- [ ] Feedback list displays chronologically
- [ ] Edit button only shows for own feedback
- [ ] Edit button only shows within 24-hour window
- [ ] Timestamps format correctly
- [ ] Rich text formatting preserved
- [ ] Responsive design works on mobile
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility

### Unit Tests (Future)

```typescript
describe('FeedbackForm', () => {
  it('validates minimum character count', () => {
    // Test validation
  });

  it('validates maximum character count', () => {
    // Test validation
  });

  it('disables submit when content is invalid', () => {
    // Test button state
  });

  it('shows loading state during submission', () => {
    // Test loading state
  });

  it('pre-fills content in edit mode', () => {
    // Test edit mode
  });
});

describe('FeedbackDisplay', () => {
  it('displays feedback in chronological order', () => {
    // Test ordering
  });

  it('shows edit button for own feedback within 24 hours', () => {
    // Test edit button visibility
  });

  it('hides edit button after 24 hours', () => {
    // Test time limit
  });

  it('shows empty state when no feedback', () => {
    // Test empty state
  });
});
```

## Related Requirements

This implementation addresses:

- **AC5: Feedback System**
  - ✅ Lecturers can write and send feedback on complaints
  - ✅ Students receive notifications when feedback is provided (Phase 12)
  - ✅ Feedback is associated with the specific complaint
  - ✅ Students can view feedback history on their complaints

- **P5: Feedback Association**
  - ✅ Every feedback entry is associated with exactly one complaint and one lecturer
  - ✅ Foreign key constraints ensure data integrity (Phase 12)

## Files Created

1. `src/components/complaints/feedback-form.tsx` - Main form component
2. `src/components/complaints/feedback-display.tsx` - Display component
3. `src/components/complaints/__tests__/feedback-form-demo.md` - Documentation
4. `src/components/complaints/__tests__/feedback-form-visual-demo.tsx` - Visual demo
5. `src/components/complaints/README_FEEDBACK_FORM.md` - This file

## Next Steps

1. ✅ Create feedback form component
2. ✅ Create feedback display component
3. ✅ Add to component exports
4. ✅ Create documentation and demo
5. ⏳ Integrate into complaint detail view (Task 5.1 sub-task)
6. ⏳ Create notification on feedback submission (Task 6.1)
7. ⏳ Add feedback to complaint history timeline (already supported)
8. ⏳ Implement real API integration (Phase 12)

## Notes

- Following UI-first development approach
- All API calls are mocked for now
- Real database integration in Phase 12
- Components are fully functional for UI testing
- Mock data provides realistic examples
- Ready for integration into complaint detail view

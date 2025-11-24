# Feedback Form Demo

This document demonstrates the feedback form functionality for lecturers.

## Overview

The feedback form allows lecturers to provide detailed feedback on student complaints. It includes:

- Rich text editor for formatted feedback
- Character count validation (10-5000 characters)
- Loading states during submission
- Success/error messages
- Edit capability within 24 hours
- Automatic notification to students

## Components Created

### 1. FeedbackForm Component
**Location**: `src/components/complaints/feedback-form.tsx`

**Features**:
- Rich text editor with formatting options
- Minimum 10 characters, maximum 5000 characters
- Real-time character count
- Validation with error messages
- Loading state during submission
- Success confirmation
- Edit mode for existing feedback
- Cancel functionality

**Props**:
```typescript
interface FeedbackFormProps {
  complaintId: string;           // ID of the complaint
  onSubmit?: (content: string) => Promise<void>;  // Submit callback
  onCancel?: () => void;         // Cancel callback
  existingFeedback?: Feedback;   // For editing existing feedback
  isEditing?: boolean;           // Edit mode flag
}
```

**Usage Example**:
```tsx
import { FeedbackForm } from '@/components/complaints';

// Add new feedback
<FeedbackForm
  complaintId="complaint-123"
  onSubmit={async (content) => {
    // Handle submission
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
    // Handle update
    await updateFeedback(content);
  }}
  onCancel={() => setEditMode(false)}
/>
```

### 2. FeedbackDisplay Component
**Location**: `src/components/complaints/feedback-display.tsx`

**Features**:
- Display all feedback in chronological order
- Show lecturer information and avatar
- Relative timestamps (e.g., "2 hours ago")
- Edit indicator for modified feedback
- Edit button for own feedback (within 24 hours)
- Add feedback button for lecturers
- Empty state when no feedback exists
- Inline editing mode

**Props**:
```typescript
interface FeedbackDisplayProps {
  complaintId: string;           // ID of the complaint
  feedback?: FeedbackWithUser[]; // Array of feedback entries
  userRole?: 'student' | 'lecturer' | 'admin';  // Current user role
  currentUserId?: string;        // Current user ID
  onAddFeedback?: () => void;    // Add feedback callback
  onEditFeedback?: (feedbackId: string) => void;  // Edit callback
}
```

**Usage Example**:
```tsx
import { FeedbackDisplay } from '@/components/complaints';

<FeedbackDisplay
  complaintId="complaint-123"
  feedback={feedbackList}
  userRole="lecturer"
  currentUserId="lecturer-456"
  onAddFeedback={() => console.log('Adding feedback')}
  onEditFeedback={(id) => console.log('Editing feedback:', id)}
/>
```

## UI States

### 1. Empty State (No Feedback)
- Shows empty state icon and message
- "Add Feedback" button for lecturers
- Clean, centered layout

### 2. Add Feedback Mode
- Rich text editor with formatting toolbar
- Character counter
- Validation messages
- Submit and Cancel buttons
- Info alert about notification

### 3. Display Feedback
- Lecturer avatar and name
- Timestamp with relative time
- Formatted feedback content
- Edit button (if applicable)
- "Edited" indicator if modified

### 4. Edit Feedback Mode
- Pre-filled with existing content
- Same editor as add mode
- Update and Cancel buttons
- Time limit notice

### 5. Loading State
- Disabled form during submission
- Loading spinner on submit button
- "Sending..." or "Updating..." text

### 6. Success State
- Green success alert
- Confirmation message
- Auto-close after 2 seconds

### 7. Error State
- Red error alert
- Error message
- Form remains open for retry

## Validation Rules

1. **Content Required**: Feedback cannot be empty
2. **Minimum Length**: At least 10 characters (excluding HTML)
3. **Maximum Length**: No more than 5000 characters
4. **Edit Time Limit**: Can only edit within 24 hours of creation

## Mock Data (UI-First Approach)

Following the UI-first development approach, the components use mock data for demonstration:

```typescript
// Mock feedback data
const mockFeedback = [
  {
    id: 'feedback-1',
    complaint_id: 'complaint-123',
    lecturer_id: 'lecturer-456',
    content: '<p>Thank you for reporting this issue...</p>',
    created_at: '2024-11-18T10:00:00Z',
    updated_at: '2024-11-18T10:00:00Z',
    lecturer: {
      id: 'lecturer-456',
      full_name: 'Dr. Sarah Smith',
      email: 'dr.smith@university.edu',
      role: 'lecturer',
    },
  },
];
```

## Integration with Complaint Detail View

The feedback components should be integrated into the complaint detail page:

```tsx
import { FeedbackDisplay } from '@/components/complaints';

function ComplaintDetailPage({ complaintId }) {
  const [feedback, setFeedback] = useState([]);
  const userRole = 'lecturer'; // From auth context
  const currentUserId = 'lecturer-456'; // From auth context

  return (
    <div className="space-y-6">
      {/* Other complaint details */}
      
      {/* Feedback Section */}
      <FeedbackDisplay
        complaintId={complaintId}
        feedback={feedback}
        userRole={userRole}
        currentUserId={currentUserId}
      />
    </div>
  );
}
```

## Phase 12 Integration Notes

When implementing real API integration in Phase 12:

1. **Submit Feedback**:
   ```typescript
   await supabase.from('feedback').insert({
     complaint_id: complaintId,
     lecturer_id: currentUser.id,
     content: content,
   });
   ```

2. **Update Feedback**:
   ```typescript
   await supabase.from('feedback')
     .update({ content, updated_at: new Date().toISOString() })
     .eq('id', feedbackId);
   ```

3. **Create Notification**:
   ```typescript
   await supabase.from('notifications').insert({
     user_id: complaint.student_id,
     type: 'feedback_received',
     title: 'New Feedback Received',
     message: 'A lecturer has provided feedback on your complaint',
     related_id: complaintId,
   });
   ```

4. **Log History**:
   ```typescript
   await supabase.from('complaint_history').insert({
     complaint_id: complaintId,
     action: 'feedback_added',
     performed_by: currentUser.id,
   });
   ```

5. **Fetch Feedback**:
   ```typescript
   const { data } = await supabase
     .from('feedback')
     .select('*, lecturer:users!lecturer_id(*)')
     .eq('complaint_id', complaintId)
     .order('created_at', { ascending: true });
   ```

## Accessibility

- Proper ARIA labels on form elements
- Keyboard navigation support
- Focus management
- Screen reader friendly
- Color contrast compliance

## Responsive Design

- Mobile-friendly layout
- Touch-friendly buttons
- Responsive text editor
- Adaptive spacing

## Testing Checklist

- [ ] Form validation works correctly
- [ ] Character count updates in real-time
- [ ] Submit button disabled when invalid
- [ ] Loading state displays during submission
- [ ] Success message shows after submission
- [ ] Error handling works properly
- [ ] Edit mode pre-fills content correctly
- [ ] Edit time limit enforced (24 hours)
- [ ] Cancel button works
- [ ] Empty state displays correctly
- [ ] Feedback list displays chronologically
- [ ] Edit button only shows for own feedback
- [ ] Timestamps format correctly
- [ ] Rich text formatting preserved

## Related Requirements

This implementation addresses:
- **AC5**: Feedback System
  - Lecturers can write and send feedback on complaints
  - Students receive notifications when feedback is provided
  - Feedback is associated with the specific complaint
  - Students can view feedback history on their complaints

- **P5**: Feedback Association
  - Every feedback entry is associated with exactly one complaint and one lecturer
  - Foreign key constraints ensure data integrity

## Next Steps

1. Integrate feedback components into complaint detail view
2. Add feedback to complaint list preview (optional)
3. Create notification system for feedback events (Task 6.1)
4. Implement feedback history in timeline (already supported)
5. Add feedback analytics to dashboard (Phase 8)

## Notes

- Following UI-first development approach - all API calls are mocked
- Real database integration will be done in Phase 12
- Components are fully functional for UI testing and demonstration
- Mock data provides realistic examples for development

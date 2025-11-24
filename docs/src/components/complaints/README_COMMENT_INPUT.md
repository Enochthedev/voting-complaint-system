# Comment Input Component

## Overview

The `CommentInput` component is a reusable, feature-rich input component for adding and editing comments on complaints. It provides a clean interface with validation, character counting, and support for internal notes (lecturer-only feature).

## Features

- ✅ **Character Validation**: Configurable min/max length with real-time feedback
- ✅ **Auto-resize Textarea**: Automatically adjusts height based on content
- ✅ **Internal Notes**: Toggle for lecturer-only internal comments
- ✅ **Keyboard Shortcuts**: Ctrl+Enter to submit, Escape to cancel
- ✅ **Loading States**: Visual feedback during submission
- ✅ **Error Handling**: Clear error messages for validation failures
- ✅ **Edit Mode**: Support for editing existing comments
- ✅ **Auto-focus**: Optional auto-focus on mount
- ✅ **Accessibility**: Proper ARIA labels and keyboard navigation

## Usage

### Basic Usage

```tsx
import { CommentInput } from '@/components/complaints';

function MyComponent() {
  const handleSubmit = async (comment: string, isInternal: boolean) => {
    // Submit comment to API
    await addComment(complaintId, comment, isInternal);
  };

  return (
    <CommentInput
      onSubmit={handleSubmit}
      placeholder="Add your comment..."
    />
  );
}
```

### With Internal Notes (Lecturer Only)

```tsx
<CommentInput
  onSubmit={handleSubmit}
  showInternalToggle={userRole === 'lecturer'}
  placeholder="Add a comment or internal note..."
/>
```

### Edit Mode

```tsx
<CommentInput
  onSubmit={handleUpdate}
  onCancel={handleCancelEdit}
  initialValue={existingComment.comment}
  initialIsInternal={existingComment.is_internal}
  isEditing={true}
  showInternalToggle={userRole === 'lecturer'}
/>
```

### With Custom Validation

```tsx
<CommentInput
  onSubmit={handleSubmit}
  minLength={10}
  maxLength={500}
  placeholder="Write a detailed comment (minimum 10 characters)..."
/>
```

### With Auto-focus

```tsx
<CommentInput
  onSubmit={handleSubmit}
  autoFocus={true}
  placeholder="Your comment will be posted publicly..."
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | `"Write your comment here..."` | Placeholder text for the textarea |
| `onSubmit` | `(comment: string, isInternal: boolean) => Promise<void>` | - | Callback when comment is submitted |
| `onCancel` | `() => void` | - | Callback when cancel is clicked |
| `showInternalToggle` | `boolean` | `false` | Whether to show the internal note toggle |
| `isLoading` | `boolean` | `false` | External loading state |
| `initialValue` | `string` | `""` | Initial value for the comment (for editing) |
| `initialIsInternal` | `boolean` | `false` | Initial value for internal flag (for editing) |
| `isEditing` | `boolean` | `false` | Whether this is editing an existing comment |
| `minLength` | `number` | `1` | Minimum character length |
| `maxLength` | `number` | `2000` | Maximum character length |
| `autoFocus` | `boolean` | `false` | Whether to auto-focus the textarea on mount |
| `className` | `string` | `""` | Custom class name for the container |

## Keyboard Shortcuts

- **Ctrl+Enter** (or **Cmd+Enter** on Mac): Submit the comment
- **Escape**: Cancel editing (if `onCancel` is provided)

## Validation

The component validates:
- **Empty comments**: Cannot submit empty or whitespace-only comments
- **Minimum length**: Configurable via `minLength` prop
- **Maximum length**: Configurable via `maxLength` prop (default 2000 characters)

Validation errors are displayed below the textarea with clear messaging.

## Character Counter

The character counter shows:
- **Green/Gray**: Within valid range
- **Orange**: Below minimum length (warning)
- **Red**: Over maximum length (error, submit disabled)

Format: `{current}/{maximum}`

## Internal Notes

When `showInternalToggle={true}`:
- A checkbox appears below the textarea
- Checking it marks the comment as "internal"
- Internal comments are only visible to lecturers and admins
- An info alert appears when internal is checked
- The internal flag is passed to the `onSubmit` callback

## Loading States

During submission:
- Textarea is disabled
- Submit button shows loading spinner
- Button text changes to "Posting..." or "Updating..."
- Cancel button is disabled

## Error Handling

Errors are displayed in two ways:
1. **Validation errors**: Shown below textarea in red
2. **Submission errors**: Shown in an alert banner above the form

## Integration with Complaint Detail View

The component is designed to integrate seamlessly with the complaint detail view:

```tsx
import { CommentInput } from '@/components/complaints';

function ComplaintDetailView() {
  const handleAddComment = async (comment: string, isInternal: boolean) => {
    // In Phase 12, this will call Supabase API
    await supabase.from('complaint_comments').insert({
      complaint_id: complaintId,
      user_id: currentUser.id,
      comment,
      is_internal: isInternal,
    });
    
    // Refresh comments list
    await refreshComments();
  };

  return (
    <div>
      {/* ... other content ... */}
      
      <div className="mt-6">
        <h3 className="mb-4 text-lg font-semibold">Add Comment</h3>
        <CommentInput
          onSubmit={handleAddComment}
          showInternalToggle={userRole === 'lecturer'}
          placeholder="Share your thoughts or provide an update..."
        />
      </div>
    </div>
  );
}
```

## Styling

The component uses Tailwind CSS classes and follows the design system:
- Consistent with other form components (Button, Label, Alert)
- Dark mode support
- Responsive design
- Focus states with ring indicators
- Disabled states with reduced opacity

## Accessibility

- Proper ARIA labels (`aria-invalid`, `aria-describedby`)
- Keyboard navigation support
- Focus management
- Error announcements for screen readers
- Semantic HTML structure

## Phase 12 Integration

Currently uses mock data for UI development. In Phase 12, the component will integrate with:

1. **Supabase API**: Real comment submission and updates
2. **Database Triggers**: Automatic notification creation
3. **Real-time Updates**: Live comment updates via Supabase Realtime
4. **History Logging**: Automatic logging in complaint_history table

Example Phase 12 implementation:

```tsx
const handleSubmit = async (comment: string, isInternal: boolean) => {
  // Insert comment
  const { data, error } = await supabase
    .from('complaint_comments')
    .insert({
      complaint_id: complaintId,
      user_id: currentUser.id,
      comment,
      is_internal: isInternal,
    })
    .select()
    .single();

  if (error) throw error;

  // Database triggers will automatically:
  // 1. Create notification for complaint owner (if not internal)
  // 2. Create notification for assigned lecturer
  // 3. Log comment in complaint_history
  
  // Refresh comments list
  await refreshComments();
};
```

## Testing

The component includes comprehensive validation and error handling that can be tested:

1. **Empty submission**: Try submitting without text
2. **Character limits**: Test min/max length validation
3. **Internal toggle**: Verify internal flag is passed correctly
4. **Keyboard shortcuts**: Test Ctrl+Enter and Escape
5. **Edit mode**: Test editing existing comments
6. **Loading states**: Verify disabled states during submission
7. **Error handling**: Test error display and recovery

## Related Components

- `ComplaintDetailView`: Main container for comments
- `FeedbackForm`: Similar form component for lecturer feedback
- `Button`: Used for submit/cancel actions
- `Label`: Used for form labels
- `Alert`: Used for error and info messages

## Future Enhancements

Potential improvements for future versions:
- Rich text formatting support
- @mentions for tagging users
- File attachments in comments
- Emoji picker
- Comment reactions
- Draft auto-save
- Real-time typing indicators

# Complaint Components

## ComplaintForm

A comprehensive form component for submitting complaints with all required fields.

### Features

- **Title field** with character counter (max 200 characters)
- **Category dropdown** with predefined categories:
  - Academic
  - Facilities
  - Harassment
  - Course Content
  - Administrative
  - Other
- **Priority selector** with visual indicators:
  - Low (blue)
  - Medium (yellow)
  - High (orange)
  - Critical (red)
- **Description textarea** with character counter (max 5000 characters)
- **Anonymous submission toggle** with privacy notice
- **Tag input** with add/remove functionality
- **Form validation** for required fields
- **Draft saving** capability
- **Loading states** for both draft and submit actions
- **Error handling** with inline error messages

### Usage

```tsx
import { ComplaintForm } from '@/components/complaints/complaint-form';

function MyPage() {
  const handleSubmit = async (data, isDraft) => {
    // Handle form submission
    console.log('Form data:', data);
    console.log('Is draft:', isDraft);
  };

  const handleCancel = () => {
    // Handle cancel action
    router.back();
  };

  return (
    <ComplaintForm 
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      initialData={{
        title: 'Pre-filled title',
        category: 'academic',
        // ... other fields
      }}
      isEditing={false}
    />
  );
}
```

### Props

- `onSubmit?: (data: ComplaintFormData, isDraft: boolean) => Promise<void>` - Callback when form is submitted
- `onCancel?: () => void` - Callback when cancel button is clicked
- `initialData?: Partial<ComplaintFormData>` - Initial form values (for editing)
- `isEditing?: boolean` - Whether the form is in edit mode

### Form Data Structure

```typescript
interface ComplaintFormData {
  title: string;
  description: string;
  category: ComplaintCategory | '';
  priority: ComplaintPriority | '';
  isAnonymous: boolean;
  tags: string[];
}
```

### Validation Rules

**For Submission:**
- Title: Required, max 200 characters
- Description: Required, max 5000 characters
- Category: Required
- Priority: Required
- Tags: Optional

**For Draft:**
- All fields are optional
- Length limits still apply if content is provided

### Current Status

✅ **Phase 3-11: UI Development**
- Form uses mock data and console logging
- No actual API calls to Supabase
- Simulated loading states and delays

🔄 **Phase 12: API Integration (Pending)**
- Will connect to Supabase for real data submission
- Will implement actual file upload
- Will add proper error handling from API

### Related Components

- `/app/complaints/new/page.tsx` - New complaint submission page
- Future: `/app/complaints/[id]/edit/page.tsx` - Edit complaint page
- Future: `/app/complaints/drafts/page.tsx` - Draft complaints list

### Design Decisions

1. **Anonymous Toggle**: Placed at the top with clear privacy notice to ensure users understand the implications
2. **Priority Selector**: Uses visual buttons instead of dropdown for better UX and immediate visual feedback
3. **Character Counters**: Helps users stay within limits and provides clear feedback
4. **Tag System**: Simple add/remove interface with Enter key support for quick tagging
5. **Dual Submit**: Separate buttons for "Save as Draft" and "Submit" to support the draft workflow

### Accessibility

- All form fields have proper labels
- Error messages are associated with their fields
- Keyboard navigation supported
- ARIA labels for icon buttons
- Focus management for better UX

### Future Enhancements

- Rich text editor for description (mentioned in task details)
- Template selector integration
- File upload component integration
- Autocomplete for tags based on existing tags
- Real-time character count warnings
- Form auto-save to prevent data loss

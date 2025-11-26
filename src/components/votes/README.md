# Vote Components

This directory contains components for the voting system, allowing lecturers to create polls for students.

## Components

### VoteForm

A comprehensive form component for creating and editing voting polls.

**Features:**
- Title and description fields with validation
- Dynamic vote options (minimum 2, can add more)
- Optional complaint linking
- Optional closing date/time
- Active/inactive status toggle
- Comprehensive validation
- Character counters
- Error handling

**Props:**
```typescript
interface VoteFormProps {
  vote?: Vote | null;           // Existing vote for editing (optional)
  onSave: (vote: Partial<Vote>) => void;  // Callback when form is submitted
  onCancel: () => void;         // Callback when form is cancelled
  isLoading?: boolean;          // Loading state for async operations
}
```

**Usage:**
```tsx
import { VoteForm } from '@/components/votes';

function CreateVotePage() {
  const handleSave = async (voteData: Partial<Vote>) => {
    // Save vote to database
    await createVote(voteData);
  };

  const handleCancel = () => {
    // Navigate back or close form
    router.push('/admin/votes');
  };

  return (
    <VoteForm
      onSave={handleSave}
      onCancel={handleCancel}
      isLoading={false}
    />
  );
}
```

**Validation Rules:**
- Title: 5-200 characters, required
- Description: 10-1000 characters, required
- Options: Minimum 2 options, each max 200 characters, must be unique
- Closing date: Must be in the future (if provided)

**Data Structure:**
The form outputs vote data in the following format:
```typescript
{
  title: string;
  description: string;
  options: string[];  // Array of option texts
  is_active: boolean;
  related_complaint_id: string | null;
  closes_at: string | null;  // ISO date string
}
```

## Pages

### /admin/votes/new

Page for creating new votes. Uses the VoteForm component with mock data handling.

**Features:**
- Form validation
- Success/error alerts
- Auto-redirect after successful creation
- Mock API implementation (to be replaced in Phase 12)

### /admin/votes

Listing page for all votes with empty state and create button.

**Features:**
- Empty state with call-to-action
- Navigation to create page
- Placeholder for vote list (to be implemented in future tasks)

## Future Enhancements

The following features will be implemented in subsequent tasks:
- Vote submission (save to database)
- Vote listing with filters
- Vote detail page
- Student voting interface
- Vote results display
- Vote closing functionality
- Notifications for new votes

## Design Patterns

This component follows the established design patterns in the application:
- Uses design tokens (CSS variables) for theming
- Follows the same form structure as ComplaintForm and TemplateForm
- Implements comprehensive validation
- Provides clear user feedback
- Supports both light and dark modes
- Mobile-responsive design

## Notes

- Currently uses mock data (UI-first development approach)
- API integration will be completed in Phase 12
- Component is fully functional for UI testing and development
- All TypeScript types are properly defined

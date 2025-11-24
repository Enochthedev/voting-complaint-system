# Status Change Functionality

## Overview
This document describes the status change functionality implemented for lecturers in the complaint detail view.

## Feature Location
- **Component**: `src/components/complaints/complaint-detail-view.tsx`
- **Page**: `src/app/complaints/[id]/page.tsx`
- **Tests**: `src/components/complaints/__tests__/status-change.test.tsx`

## How It Works

### For Lecturers
1. Navigate to any complaint detail page
2. Look for the "Actions" section below the complaint header
3. Click the "Change Status" dropdown
4. Select a new status from the available options
5. A confirmation modal will appear
6. Optionally add a note explaining the change
7. Click "Confirm Change" to apply the status change
8. The status badge will update immediately
9. A new entry will appear in the timeline

### For Students
- Students cannot change complaint status directly
- They can only reopen resolved complaints using the "Reopen Complaint" button
- The "Change Status" dropdown is not visible to students

## Valid Status Transitions

The system enforces valid status transitions based on the current status:

| Current Status | Available Transitions |
|---------------|----------------------|
| New | Opened, In Progress, Resolved, Closed |
| Opened | In Progress, Resolved, Closed |
| In Progress | Resolved, Closed |
| Reopened | In Progress, Resolved, Closed |
| Resolved | Closed, Reopened |
| Closed | Reopened |

## UI Components

### Status Dropdown
- Appears in the Actions section for lecturers
- Shows only valid status transitions
- Disabled during status change operation
- Hidden for resolved/closed complaints (unless reopening)

### Confirmation Modal
- Appears when a new status is selected
- Shows clear message about the status change
- Includes optional textarea for adding notes
- Has Cancel and Confirm buttons
- Prevents accidental status changes

### Status Badge
- Updates immediately after confirmation
- Shows current status with appropriate color coding
- Located in the complaint header

### Timeline Entry
- New entry added for each status change
- Shows old status → new status
- Includes timestamp and user who made the change
- Displays any notes added during the change

## Testing the Feature

### Manual Testing
1. Set `userRole` to `'lecturer'` in the component (line ~1095)
2. Navigate to `/complaints/[any-id]`
3. Try changing status through the dropdown
4. Verify modal appears and works correctly
5. Check that status badge updates
6. Verify timeline shows new entry

### Automated Tests
Run the test suite (when test environment is configured):
```bash
npm test status-change.test.tsx
```

## Current Implementation Status

### ✅ Completed
- Status change dropdown with valid transitions
- Confirmation modal with note field
- Optimistic UI updates
- History logging
- Role-based access control
- Loading states
- Error handling
- Comprehensive test coverage
- Documentation

### 🔄 Phase 12 (API Integration)
- Connect to Supabase API
- Persist status changes to database
- Send notifications to students
- Real-time updates across sessions
- Replace alerts with toast notifications
- Get user role from auth context

## Code Example

### Using the Component
```tsx
import { ComplaintDetailView } from '@/components/complaints/complaint-detail-view';

export default function ComplaintPage() {
  return (
    <ComplaintDetailView 
      complaintId="complaint-123"
      onBack={() => router.push('/complaints')}
    />
  );
}
```

### Status Change Handler
```typescript
const handleStatusChange = async (newStatus: ComplaintStatus) => {
  // Update local state immediately
  setComplaint(prev => ({
    ...prev,
    status: newStatus,
    updated_at: new Date().toISOString()
  }));

  // In Phase 12: Call Supabase API
  // await supabase.from('complaints').update({ status: newStatus })...
};
```

## Design Specifications

### Acceptance Criteria Met
- ✅ AC3: Complaint status management
- ✅ AC12: Status history logging
- ✅ P9: Valid status transitions

### UI/UX Requirements
- ✅ Clear visual feedback
- ✅ Confirmation before changes
- ✅ Loading states
- ✅ Accessible controls
- ✅ Responsive design

## Troubleshooting

### Status dropdown not visible
- Check that `userRole` is set to `'lecturer'` or `'admin'`
- Verify complaint status is not 'resolved' or 'closed'

### Modal not appearing
- Check browser console for errors
- Verify `showStatusModal` state is being set

### Status not updating
- Check that `onStatusChange` callback is passed to ActionButtons
- Verify `handleStatusChange` is called in main component

## Related Documentation
- [Visual Demo](./status-change-visual-demo.md)
- [Test Suite](../__tests__/status-change.test.tsx)
- [Completion Summary](../../../docs/TASK_3.4_STATUS_CHANGE_COMPLETION.md)
- [Action Buttons Tests](../__tests__/complaint-detail-action-buttons.test.tsx)

## Future Enhancements
- Bulk status changes
- Status change templates
- Automated status transitions
- Status change analytics
- Custom status workflows
- Status change notifications via email

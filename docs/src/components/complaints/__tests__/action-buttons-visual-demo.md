# Action Buttons Visual Demo

This document demonstrates how action buttons appear for different user roles in the Complaint Detail View.

## Overview

The action buttons are displayed in a bordered container below the complaint header. The buttons shown depend on:
1. **User Role** (Student, Lecturer, or Admin)
2. **Complaint Status** (new, opened, in_progress, resolved, closed, reopened)

## Student View

### Active Complaint (Status: new, opened, in_progress, reopened)

```
┌─────────────────────────────────────────────────────────┐
│ Actions                                                  │
│                                                          │
│ [💬 Add Comment]                                        │
└─────────────────────────────────────────────────────────┘
```

**Available Actions:**
- **Add Comment**: Scrolls to the comments section and focuses the textarea

### Resolved Complaint (Status: resolved)

```
┌─────────────────────────────────────────────────────────┐
│ Actions                                                  │
│                                                          │
│ [💬 Add Comment] [⚠️ Reopen Complaint] [✓ Rate Resolution] │
└─────────────────────────────────────────────────────────┘
```

**Available Actions:**
- **Add Comment**: Scrolls to the comments section
- **Reopen Complaint**: Allows student to reopen if issue persists (AC15)
- **Rate Resolution**: Allows student to rate satisfaction (AC16)

## Lecturer/Admin View

### Active Complaint (Status: new, opened, in_progress, reopened)

```
┌─────────────────────────────────────────────────────────┐
│ Actions                                                  │
│                                                          │
│ [Change Status ▼] [👤 Assign] [💬 Add Feedback] [📄 Add Internal Note] │
└─────────────────────────────────────────────────────────┘
```

**Available Actions:**
- **Change Status**: Dropdown to change complaint status
  - Options: Opened, In Progress, Resolved, Closed
- **Assign**: Assign complaint to a specific lecturer/department (AC17)
- **Add Feedback**: Provide feedback to the student (AC5)
- **Add Internal Note**: Add notes visible only to other lecturers/admins

### Resolved/Closed Complaint

```
┌─────────────────────────────────────────────────────────┐
│ Actions                                                  │
│                                                          │
│ This complaint has been resolved. No further actions    │
│ available.                                               │
└─────────────────────────────────────────────────────────┘
```

**No Actions Available:**
- Resolved and closed complaints cannot be modified by lecturers
- Informational message is displayed instead

## Button Styling

### Primary Button (Student: Add Comment)
- Background: Primary color (blue)
- Text: White
- Icon: MessageSquare icon on the left
- Hover: Darker shade

### Outline Buttons (All other actions)
- Background: Transparent
- Border: Gray
- Text: Dark gray
- Icon: Appropriate icon on the left
- Hover: Light gray background

### Status Dropdown
- Background: White
- Border: Gray
- Text: Dark gray
- Hover: Light gray background
- Focus: Ring effect

## Responsive Behavior

### Desktop (≥1024px)
- All buttons displayed in a single row
- Adequate spacing between buttons (gap-3)

### Tablet (768px - 1023px)
- Buttons wrap to multiple rows if needed
- Maintains spacing

### Mobile (<768px)
- Buttons stack vertically or wrap
- Full width on very small screens
- Touch-friendly sizing

## Accessibility Features

1. **Keyboard Navigation**: All buttons are keyboard accessible
2. **Screen Readers**: Proper ARIA labels and button text
3. **Focus Indicators**: Clear focus rings on keyboard navigation
4. **Disabled States**: Buttons disabled during async operations
5. **Icon + Text**: Icons complement text labels (not replacing them)

## User Flow Examples

### Student Adding a Comment

1. Student views complaint detail page
2. Clicks "Add Comment" button
3. Page smoothly scrolls to comments section
4. Comment textarea receives focus
5. Student types comment and submits

### Lecturer Changing Status

1. Lecturer views complaint detail page
2. Clicks "Change Status" dropdown
3. Selects new status (e.g., "In Progress")
4. Confirmation alert appears (Phase 12: actual API call)
5. Status badge updates
6. Timeline shows status change event

### Student Reopening Resolved Complaint

1. Student views resolved complaint
2. Sees "Reopen Complaint" button
3. Clicks button
4. Confirmation dialog appears (Phase 12)
5. Student provides justification
6. Complaint status changes to "reopened"
7. Lecturer receives notification

## Implementation Notes

### Current Phase (UI Development)
- All buttons are rendered with mock handlers
- Clicking buttons shows alert messages
- Actual functionality will be implemented in Phase 12

### Phase 12 (API Integration)
- Replace mock handlers with real API calls
- Implement actual status change logic
- Connect to Supabase for data updates
- Add proper error handling
- Show loading states during operations

## Design Compliance

This implementation follows the design specification from:
**Design Document → UI/UX Design Considerations → Complaint Detail View**

✅ Student actions: "Add Comment", "Reopen", "Rate Resolution"
✅ Lecturer actions: "Change Status", "Assign", "Add Feedback", "Add Internal Note"
✅ Context-dependent display based on role and status
✅ Proper styling and layout
✅ Accessibility compliance

## Testing

Comprehensive tests are available in:
`__tests__/complaint-detail-action-buttons.test.tsx`

Tests cover:
- Role-based button visibility
- Status-based button visibility
- Button interactions
- Accessibility compliance
- Integration with comments section

**Note**: Tests are written but not executed during UI development phase.

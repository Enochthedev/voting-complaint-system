# Status Change Functionality - Visual Demo

## Overview
This document demonstrates the status change functionality for lecturers in the complaint detail view, as implemented in Task 3.4.

## Feature Description
Lecturers can change the status of complaints through an intuitive dropdown interface with confirmation modal. The feature includes:
- Status dropdown with valid transitions only
- Confirmation modal before applying changes
- Optional note field for explaining status changes
- Real-time UI updates
- History logging

## User Flow

### Step 1: View Complaint Detail
- Lecturer navigates to a complaint detail page
- Action buttons section displays at the top
- "Change Status" dropdown is visible for active complaints

### Step 2: Select New Status
- Lecturer clicks on "Change Status" dropdown
- Dropdown shows only valid status transitions based on current status
- Example: For "In Progress" complaint, shows: "Resolved", "Closed"

### Step 3: Confirmation Modal
- Modal appears with title "Confirm Status Change"
- Shows clear message: "Change complaint status from [Old Status] to [New Status]?"
- Includes optional textarea for adding a note
- Has "Cancel" and "Confirm Change" buttons

### Step 4: Add Optional Note
- Lecturer can add explanation for status change
- Example: "Facilities team has completed the AC repair"
- Note will be included in the history log

### Step 5: Confirm Change
- Lecturer clicks "Confirm Change"
- Button shows "Changing..." during operation
- Modal closes on success
- Status badge updates immediately
- New entry appears in timeline

## Valid Status Transitions

### From "New"
- ✅ Opened
- ✅ In Progress
- ✅ Resolved
- ✅ Closed

### From "Opened"
- ✅ In Progress
- ✅ Resolved
- ✅ Closed

### From "In Progress"
- ✅ Resolved
- ✅ Closed

### From "Reopened"
- ✅ In Progress
- ✅ Resolved
- ✅ Closed

### From "Resolved"
- ✅ Closed
- ✅ Reopened

### From "Closed"
- ✅ Reopened

## UI Components

### Status Dropdown
```
┌─────────────────────┐
│ Change Status    ▼  │
├─────────────────────┤
│ Opened              │
│ In Progress         │
│ Resolved            │
│ Closed              │
└─────────────────────┘
```

### Confirmation Modal
```
┌────────────────────────────────────────┐
│  Confirm Status Change                 │
│                                        │
│  Change complaint status from          │
│  In Progress to Resolved?              │
│                                        │
│  Add a note (optional)                 │
│  ┌────────────────────────────────┐   │
│  │ Explain the reason...          │   │
│  │                                │   │
│  └────────────────────────────────┘   │
│                                        │
│              [Cancel] [Confirm Change] │
└────────────────────────────────────────┘
```

### Timeline Entry (After Status Change)
```
┌─────────────────────────────────────────┐
│ Timeline                                │
├─────────────────────────────────────────┤
│  🕐  Changed status from "In Progress"  │
│      to "Resolved"                      │
│      Dr. Sarah Smith • 2 minutes ago    │
│                                         │
│  💬  Added comment                      │
│      Dr. Sarah Smith • 1 hour ago       │
│                                         │
│  👤  Assigned complaint                 │
│      Dr. Sarah Smith • 3 hours ago      │
└─────────────────────────────────────────┘
```

## Testing the Feature

### As a Lecturer
1. Navigate to: `/complaints/[any-complaint-id]`
2. Look for the "Actions" section below the complaint header
3. Click on "Change Status" dropdown
4. Select a new status (e.g., "Resolved")
5. Modal will appear asking for confirmation
6. Optionally add a note explaining the change
7. Click "Confirm Change"
8. Observe:
   - Status badge updates at the top
   - Modal closes
   - New timeline entry appears
   - Success message (currently an alert, will be toast in Phase 12)

### As a Student
1. Navigate to: `/complaints/[any-complaint-id]`
2. "Change Status" dropdown should NOT be visible
3. Only student actions are shown: "Add Comment", "Reopen" (if resolved), "Rate Resolution" (if resolved)

## Mock Data Note
Currently using mock data for UI development (following UI-first approach). In Phase 12:
- Status changes will call Supabase API
- History will be persisted to database
- Notifications will be sent to students
- Real-time updates via Supabase Realtime

## Design Specifications Met

### Acceptance Criteria
- ✅ AC3: Complaint status management
- ✅ AC12: Status history logging
- ✅ P9: Valid status transitions

### UI/UX Requirements
- ✅ Clear visual feedback
- ✅ Confirmation before destructive actions
- ✅ Disabled state during operations
- ✅ Accessible labels and controls
- ✅ Responsive design

### Security
- ✅ Role-based access (only lecturers/admins)
- ✅ Valid transition enforcement
- ✅ Audit trail in history

## Code Location
- Component: `src/components/complaints/complaint-detail-view.tsx`
- Page: `src/app/complaints/[id]/page.tsx`
- Tests: `src/components/complaints/__tests__/status-change.test.tsx`

## Related Tasks
- Task 3.4: Build Complaint Detail View ✅
- Task 3.4 (this): Implement status change functionality (lecturer) ✅
- Task 9.2: Build Complaint History/Timeline (already implemented)

## Future Enhancements (Phase 12)
- Connect to Supabase API
- Real-time status updates
- Email notifications
- Bulk status changes
- Status change templates
- Automated status transitions based on rules

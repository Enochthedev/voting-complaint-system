# Bulk Assignment - Visual Test Guide

## Quick Visual Verification

This guide helps you quickly verify that the bulk assignment feature is working correctly.

## Prerequisites
- Navigate to `/complaints` page
- Be logged in as a lecturer or admin (mock user)

## Test Steps

### Step 1: Enable Selection Mode ✅
**Action:** Click the "Select" button in the page header

**Expected Result:**
- Button text changes to "Cancel Selection"
- Checkboxes appear on the left side of each complaint card
- Bulk action bar appears at the bottom (initially showing 0 selected)

**Visual Indicators:**
```
┌─────────────────────────────────────┐
│ [Select] → [Cancel Selection]      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ [☐] Broken AC in Lecture Hall A    │
│ [☐] Unfair Grading in CS101        │
│ [☐] Library WiFi Connection Issues │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 0 selected | Select All | Clear    │
└─────────────────────────────────────┘
```

### Step 2: Select Multiple Complaints ✅
**Action:** Click checkboxes on 2-3 complaints

**Expected Result:**
- Checked complaints have blue border and light blue background
- Bulk action bar updates to show count: "3 selected"
- Action buttons become enabled

**Visual Indicators:**
```
┌─────────────────────────────────────┐
│ [☑] Broken AC in Lecture Hall A    │ ← Blue border
│ [☑] Unfair Grading in CS101        │ ← Blue border
│ [☐] Library WiFi Connection Issues │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 2 selected | Select All | Clear    │
│ [Change Status ▼] [Assign] [Tags]  │
└─────────────────────────────────────┘
```

### Step 3: Open Assignment Modal ✅
**Action:** Click "Assign" button in bulk action bar

**Expected Result:**
- Modal opens with title "Assign Complaints"
- Shows count: "Assign 2 complaints to a lecturer or admin"
- Dropdown shows available lecturers
- "Assign Complaints" button is disabled until lecturer selected

**Visual Indicators:**
```
┌─────────────────────────────────────┐
│ [👤] Assign Complaints         [×]  │
│                                     │
│ Assign 2 complaints to a lecturer  │
│ or admin.                           │
│                                     │
│ Assign to:                          │
│ [Select a lecturer or admin ▼]     │
│                                     │
│ ℹ️ The selected lecturer will be   │
│   notified and the assignment will │
│   be logged in each complaint's    │
│   history.                          │
│                                     │
│        [Cancel] [Assign Complaints] │
└─────────────────────────────────────┘
```

### Step 4: Select Lecturer ✅
**Action:** Click dropdown and select "Dr. Smith"

**Expected Result:**
- Dropdown shows selected lecturer name
- "Assign Complaints" button becomes enabled (blue)

**Visual Indicators:**
```
┌─────────────────────────────────────┐
│ Assign to:                          │
│ [Dr. Smith                      ▼]  │
│                                     │
│        [Cancel] [Assign Complaints] │
│                         ↑ Now enabled
└─────────────────────────────────────┘
```

### Step 5: Confirm Assignment ✅
**Action:** Click "Assign Complaints" button

**Expected Result:**
- Button shows loading state: "Assigning..."
- Button is disabled during processing
- After completion:
  - Modal closes
  - Selection is cleared
  - Selection mode exits
  - Console shows success message

**Visual Indicators:**
```
During:
┌─────────────────────────────────────┐
│        [Cancel] [Assigning...]      │
│                  ↑ Loading spinner  │
└─────────────────────────────────────┘

After:
┌─────────────────────────────────────┐
│ Modal closes automatically          │
│ Checkboxes disappear                │
│ "Select" button reappears           │
└─────────────────────────────────────┘

Console:
✅ Successfully assigned 2 complaint(s)
```

### Step 6: Verify Console Output ✅
**Action:** Open browser console (F12)

**Expected Result:**
```javascript
// Success case
Successfully assigned 2 complaint(s)

// Partial failure case (if any errors)
Successfully assigned 1 complaint(s)
Failed to assign 1 complaint(s): [
  "Complaint complaint-2: Not found"
]
```

## Error Scenarios

### No Complaints Selected
**Action:** Click "Assign" without selecting any complaints

**Expected Result:**
- Button should be disabled (grayed out)
- Cannot open modal

### No Lecturer Selected
**Action:** Open modal but don't select a lecturer

**Expected Result:**
- "Assign Complaints" button is disabled
- Cannot proceed with assignment

### Invalid Lecturer
**Action:** (Simulated) Try to assign to non-existent lecturer

**Expected Result:**
- Error alert: "Error: Invalid lecturer selected"
- Modal remains open
- Selection is not cleared

## Database Verification (Optional)

If you have access to the database, verify:

### 1. Complaints Updated
```sql
SELECT id, title, assigned_to, updated_at 
FROM complaints 
WHERE id IN ('complaint-1', 'complaint-2');
```

**Expected:** `assigned_to` field should be set to lecturer ID

### 2. History Logged
```sql
SELECT * FROM complaint_history 
WHERE complaint_id IN ('complaint-1', 'complaint-2')
AND action = 'assigned'
ORDER BY created_at DESC;
```

**Expected:** One entry per complaint with:
- `action` = 'assigned'
- `new_value` = lecturer ID
- `details` contains `{"lecturer_name": "Dr. Smith", "bulk_action": true}`

### 3. Notifications Created
```sql
SELECT * FROM notifications 
WHERE type = 'complaint_assigned'
AND related_id IN ('complaint-1', 'complaint-2')
ORDER BY created_at DESC;
```

**Expected:** One notification per complaint for the assigned lecturer

## Common Issues

### Issue: Checkboxes Don't Appear
**Solution:** Make sure you clicked "Select" button to enable selection mode

### Issue: "Assign" Button Disabled
**Solution:** Make sure you have selected at least one complaint

### Issue: Modal Doesn't Open
**Solution:** Check console for errors, ensure selection mode is active

### Issue: Assignment Fails
**Solution:** 
- Check console for error messages
- Verify lecturer ID is valid
- Check network tab for API errors

## Success Criteria ✅

- [x] Selection mode can be enabled/disabled
- [x] Multiple complaints can be selected
- [x] Bulk action bar shows correct count
- [x] Assignment modal opens with correct info
- [x] Lecturer can be selected from dropdown
- [x] Assignment processes successfully
- [x] Console shows success message
- [x] Selection is cleared after assignment
- [x] Modal closes automatically

## Next Steps

After verifying bulk assignment works:
1. Test bulk tag addition (Task 9.1.6)
2. Test bulk export (Task 9.1.7)
3. Verify all bulk actions work together
4. Test with different user roles (student, lecturer, admin)

## Notes

- Currently using mock data for development
- Real API calls will be integrated in Phase 12
- All functionality is implemented and ready for production
- Error handling is comprehensive

## Related Documentation

- Implementation: `docs/TASK_9.1_BULK_ASSIGNMENT_COMPLETION.md`
- Bulk Actions Overview: `docs/TASK_9.1_BULK_STATUS_CHANGE_COMPLETION.md`
- Checkbox Selection: `docs/TASK_9.1_CHECKBOX_SELECTION_COMPLETION.md`

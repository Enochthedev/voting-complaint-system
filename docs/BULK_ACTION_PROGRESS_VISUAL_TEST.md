# Bulk Action Progress Indicator - Visual Test Guide

## Test Scenario: Bulk Status Change with Progress

### Setup
1. Navigate to `/complaints` page
2. Ensure you're logged in as a lecturer or admin
3. Have at least 10 complaints visible in the list

### Test Steps

#### 1. Select Multiple Complaints
```
✓ Click checkboxes on 10 complaints
✓ Verify bulk action bar appears at bottom of screen
✓ Verify it shows "10 complaints selected"
```

#### 2. Trigger Bulk Status Change
```
✓ Click "Change Status" button in bulk action bar
✓ Select "In Progress" from dropdown
✓ Confirmation modal appears
✓ Click "Confirm" button
```

#### 3. Observe Progress Indicator
```
Expected Visual Sequence:

[0-10%] "Preparing to change status..."
├─ Progress bar: 10% filled (blue)
├─ Percentage shown: "10%"
└─ All action buttons disabled

[10-90%] "Processing 2 of 10 complaints..."
├─ Progress bar: 30% filled (blue)
├─ Percentage shown: "30%"
├─ Message updates as batches complete
└─ Smooth animation between percentages

[90-95%] "Updating history and sending notifications..."
├─ Progress bar: 95% filled (blue)
├─ Percentage shown: "95%"
└─ Brief pause for final operations

[100%] "Status changed successfully!"
├─ Progress bar: 100% filled (blue)
├─ Percentage shown: "100%"
├─ Brief pause to show completion
└─ Progress bar disappears
```

#### 4. Verify Completion
```
✓ Progress bar disappears after ~500ms
✓ Selection is cleared (no complaints selected)
✓ Bulk action bar disappears
✓ All buttons re-enabled
```

## Test Scenario: Bulk Assignment with Progress

### Test Steps

#### 1. Select Complaints
```
✓ Select 5 complaints
✓ Bulk action bar appears
```

#### 2. Trigger Assignment
```
✓ Click "Assign" button
✓ Confirmation modal appears
✓ Click "Confirm"
✓ Assignment modal opens
```

#### 3. Complete Assignment
```
✓ Select a lecturer from dropdown
✓ Click "Assign" button in modal
✓ Modal closes
```

#### 4. Observe Progress
```
Expected Visual Sequence:

[0-10%] "Preparing to assign complaints..."
├─ Progress bar appears
└─ 10% filled

[10-30%] "Assigning 5 complaints..."
├─ Progress bar: 30% filled
└─ Message shows total count

[30-80%] "Processing assignments..."
├─ Progress bar: 80% filled
└─ Smooth animation

[80-100%] "Updating records and sending notifications..."
├─ Progress bar: 100% filled
└─ Success message appears

[Complete] "Successfully assigned 5 complaints!"
├─ Brief pause at 100%
├─ Progress bar disappears
└─ Selection cleared
```

## Test Scenario: Bulk Tag Addition with Progress

### Test Steps

#### 1. Select Complaints
```
✓ Select 8 complaints
✓ Bulk action bar appears
```

#### 2. Trigger Tag Addition
```
✓ Click "Add Tags" button
✓ Confirmation modal appears
✓ Click "Confirm"
✓ Tag addition modal opens
```

#### 3. Add Tags
```
✓ Enter tags: "urgent", "facilities"
✓ Click "Add Tags" button in modal
✓ Modal closes
```

#### 4. Observe Progress
```
Expected Visual Sequence:

[0-10%] "Preparing to add tags..."
├─ Progress bar appears
└─ 10% filled

[10-30%] "Adding 2 tags to 8 complaints..."
├─ Progress bar: 30% filled
└─ Shows tag count and complaint count

[30-80%] "Processing tag additions..."
├─ Progress bar: 80% filled
└─ Smooth animation

[80-100%] "Updating records..."
├─ Progress bar: 100% filled
└─ Final update stage

[Complete] "Successfully added tags to 8 complaints!"
├─ Brief pause at 100%
├─ Progress bar disappears
└─ Selection cleared
```

## Visual Elements to Verify

### Progress Bar Component
```
┌─────────────────────────────────────────────┐
│ Adding 2 tags to 8 complaints...      45%  │
│ ████████████████████░░░░░░░░░░░░░░░░░░░░░  │
└─────────────────────────────────────────────┘
```

**Elements:**
- Label text (left): Current operation message
- Percentage (right): Numeric progress value
- Progress bar: Blue fill showing completion
- Background: Light gray for unfilled portion

### Bulk Action Bar States

#### Normal State (No Progress)
```
┌──────────────────────────────────────────────────────────┐
│ 5 complaints selected • Select none                      │
│ ─────────────────────────────────────────────────────── │
│ [Export ▼] [Change Status ▼] [Assign] [Add Tags] [Clear]│
└──────────────────────────────────────────────────────────┘
```

#### With Progress
```
┌──────────────────────────────────────────────────────────┐
│ 5 complaints selected • Select none                      │
│ ─────────────────────────────────────────────────────── │
│ [Export ▼] [Change Status ▼] [Assign] [Add Tags] [Clear]│
│                                                           │
│ Processing 3 of 5 complaints...               60%       │
│ ████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░   │
└──────────────────────────────────────────────────────────┘
```

**Note:** All buttons are disabled (grayed out) during progress

## Edge Cases to Test

### 1. Single Complaint
```
✓ Select 1 complaint
✓ Trigger any bulk action
✓ Progress should still show
✓ Messages should use singular form: "1 complaint"
```

### 2. Large Selection (50+ complaints)
```
✓ Select 50 complaints
✓ Trigger bulk status change
✓ Progress should update smoothly
✓ Processing should show batch progress
```

### 3. Rapid Action Attempts
```
✓ Select complaints
✓ Trigger bulk action
✓ Try clicking other buttons during progress
✓ All buttons should be disabled
✓ No new actions should start
```

### 4. Multiple Progress Types
```
✓ Export progress and bulk action progress are separate
✓ Only one should show at a time
✓ Both use the same visual style
```

## Accessibility Checks

### Keyboard Navigation
```
✓ Tab through action buttons
✓ Enter/Space to activate
✓ Buttons disabled during progress
```

### Screen Reader
```
✓ Progress percentage announced
✓ Status messages read aloud
✓ Button states (enabled/disabled) announced
```

### Visual Indicators
```
✓ Progress bar has sufficient contrast
✓ Percentage text is readable
✓ Disabled buttons visually distinct
```

## Performance Checks

### Animation Smoothness
```
✓ Progress bar fills smoothly (no jumps)
✓ Transitions use CSS animations
✓ No layout shifts during progress
```

### State Management
```
✓ Progress state cleared after completion
✓ No memory leaks from intervals/timeouts
✓ Component properly unmounts
```

## Success Criteria

✅ Progress bar appears for all bulk actions
✅ Progress updates smoothly from 0% to 100%
✅ Status messages are clear and descriptive
✅ All buttons disabled during operations
✅ Progress bar disappears after completion
✅ Selection cleared on success
✅ No visual glitches or layout shifts
✅ Accessible to keyboard and screen readers

## Common Issues and Solutions

### Issue: Progress bar doesn't appear
**Solution:** Check that `isBulkActionLoading` is set to `true`

### Issue: Progress stuck at certain percentage
**Solution:** Verify async operations are completing properly

### Issue: Buttons not disabled during progress
**Solution:** Check `isAnyActionInProgress` flag is working

### Issue: Progress bar doesn't disappear
**Solution:** Ensure state is cleared in finally block

## Related Documentation

- [Task 9.1 Implementation](./TASK_9.1_BULK_ACTION_PROGRESS_INDICATOR.md)
- [Bulk Action Bar Component](../src/components/complaints/bulk-action-bar.tsx)
- [Progress Component](../src/components/ui/progress.tsx)

# "Assigned to Me" Quick Filter - Quick Start Guide

## What is it?

The "Assigned to Me" quick filter is a one-click button that allows lecturers and admins to instantly view only the complaints assigned to them.

## Where to Find It

1. Log in as a lecturer or admin
2. Navigate to the Complaints page (`/complaints`)
3. Look for the quick filter buttons **between the search bar and the main content**

## How to Use

### Basic Usage

**Step 1**: Click the "Assigned to Me" button
```
┌─────────────────┐
│ Assigned to Me  │  ← Click here
└─────────────────┘
```

**Step 2**: The list updates to show only your assigned complaints
```
Before: 100 complaints (all)
After:  15 complaints (assigned to you)
```

**Step 3**: Click again to turn off the filter
```
┌─────────────────┐
│ Assigned to Me  │  ← Click again to clear
│    (ACTIVE)     │
└─────────────────┘
```

### Combining with Other Filters

You can use "Assigned to Me" with other quick filters:

**Example 1: My High Priority Complaints**
1. Click "Assigned to Me"
2. Click "High Priority"
3. Result: Only high/critical priority complaints assigned to you

**Example 2: My Unresolved Complaints**
1. Click "Assigned to Me"
2. Click "Unresolved"
3. Result: Only unresolved complaints assigned to you

### Using with Filter Panel

The quick filter works with the detailed filter panel:

1. Click "Assigned to Me"
2. Open the filter panel
3. Add additional filters (category, date range, tags, etc.)
4. Result: Highly specific filtered view

## Visual Indicators

### Button States

**Inactive (Not Applied)**
- Outline style
- Gray border
- White background
- Text: "Assigned to Me"

**Active (Applied)**
- Solid style
- Dark background
- White text
- Text: "Assigned to Me"

### Filter Panel Sync

When "Assigned to Me" is active:
- The filter panel's "Assigned To" dropdown shows your name selected
- An active filter chip appears showing "Assigned: [Your Name]"

## Common Scenarios

### Scenario 1: Daily Workload Check

**Goal**: See what complaints you need to work on today

**Steps**:
1. Click "Assigned to Me"
2. Click "Unresolved"
3. Review the filtered list

**Result**: Clear view of your pending work

### Scenario 2: Urgent Items First

**Goal**: Focus on critical complaints assigned to you

**Steps**:
1. Click "Assigned to Me"
2. Click "High Priority"
3. Sort by priority (if needed)

**Result**: Your most urgent complaints at the top

### Scenario 3: Review Completed Work

**Goal**: See what you've resolved recently

**Steps**:
1. Click "Assigned to Me"
2. Open filter panel
3. Select "Resolved" status
4. Set date range to "Last 7 days"

**Result**: Your completed work from the past week

## Tips and Tricks

### Tip 1: Quick Toggle
- The filter toggles on/off with each click
- No need to manually clear it from the filter panel

### Tip 2: Combine Filters
- Use multiple quick filters together
- Add filter panel options for more specificity

### Tip 3: Save as Preset
- Once you have a useful combination of filters
- Click "Save Filter Preset" in the filter panel
- Give it a name like "My Urgent Work"
- Access it quickly in the future

### Tip 4: Clear All Filters
- If you have multiple filters active
- Click "Clear All" in the filter panel
- Resets everything including quick filters

## Keyboard Shortcuts

- **Tab**: Navigate to the button
- **Enter** or **Space**: Activate/deactivate the filter
- **Tab** again: Move to next quick filter button

## Mobile Usage

On mobile devices:
- Buttons may stack vertically
- Same tap behavior as desktop
- Visual feedback on touch
- Scrollable if needed

## Troubleshooting

### "I don't see the quick filter buttons"

**Possible Causes**:
1. You're logged in as a student (students don't see quick filters)
2. You're on a different page (quick filters only on `/complaints`)

**Solution**: Ensure you're logged in as a lecturer/admin and on the complaints page

### "The filter doesn't seem to work"

**Possible Causes**:
1. No complaints are assigned to you
2. Other filters are too restrictive

**Solution**: 
- Check if you have any assigned complaints
- Clear other filters and try again

### "The button stays active but shows all complaints"

**Possible Causes**:
1. The filter was cleared by another action
2. Page was refreshed

**Solution**: Click the button again to reactivate

## Related Features

- **Filter Panel**: More detailed filtering options
- **Filter Presets**: Save and load filter combinations
- **Search**: Find specific complaints by keyword
- **Assignment Dropdown**: Assign complaints to yourself or others

## For Developers

### Implementation Location
- File: `src/app/complaints/page.tsx`
- Lines: ~545-600 (quick filters section)

### State Management
```typescript
filters.assignedTo === userId // Check if active
setFilters({ ...filters, assignedTo: userId }) // Activate
setFilters({ ...filters, assignedTo: '' }) // Deactivate
```

### Testing
- Unit tests: `src/components/complaints/__tests__/assigned-to-me-filter.test.tsx`
- Visual demo: `src/components/complaints/__tests__/assigned-to-me-filter-demo.md`

## Support

For issues or questions:
1. Check the visual demo document for detailed examples
2. Review the test file for expected behavior
3. Consult the completion summary document

## Version

- Feature: Assigned to Me Quick Filter
- Task: 4.4 (Build Complaint Assignment System)
- Status: ✅ Complete
- Date: November 20, 2024

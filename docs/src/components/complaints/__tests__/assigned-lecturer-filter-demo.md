# Assigned Lecturer Filter - Visual Demo

## Overview
The assigned lecturer filter allows lecturers and admins to filter complaints based on who they are assigned to. This is useful for viewing complaints assigned to specific team members or finding unassigned complaints.

## Filter Location
The assigned lecturer filter is located in the Filter Panel sidebar, under the "Assigned To" section.

## Features

### 1. Dropdown Selection
- **Component**: Select dropdown
- **Options**: 
  - "All Lecturers" (default - shows all complaints)
  - Individual lecturer names (e.g., "Dr. Smith", "Prof. Johnson")
  - Admin names (e.g., "Admin Davis", "Admin Wilson")
- **Behavior**: Single selection only

### 2. Filter Behavior
- When "All Lecturers" is selected: Shows all complaints regardless of assignment
- When a specific lecturer is selected: Shows only complaints assigned to that lecturer
- Unassigned complaints (assigned_to = null) are excluded when filtering by a specific lecturer

### 3. Active Filter Display
When a lecturer is selected, an active filter chip appears showing:
```
Assigned: [Lecturer Name]
```
Example: `Assigned: Dr. Smith`

The chip can be removed by clicking the X icon, which resets the filter to "All Lecturers".

### 4. Integration with Other Filters
The assigned lecturer filter works in combination with other filters:
- Status filters
- Category filters
- Priority filters
- Date range filters
- Tag filters
- Sort options

All filters are applied together using AND logic.

## Use Cases

### Use Case 1: View My Assigned Complaints
**Scenario**: A lecturer wants to see only complaints assigned to them
**Steps**:
1. Open the Filter Panel
2. Expand the "Assigned To" section
3. Select their name from the dropdown
4. View filtered results

**Expected Result**: Only complaints assigned to that lecturer are displayed

### Use Case 2: Check Another Lecturer's Workload
**Scenario**: An admin wants to see how many complaints are assigned to a specific lecturer
**Steps**:
1. Open the Filter Panel
2. Select the lecturer's name from the "Assigned To" dropdown
3. View the filtered complaint count

**Expected Result**: All complaints assigned to that lecturer are shown

### Use Case 3: Find Unassigned Complaints
**Scenario**: An admin wants to find complaints that haven't been assigned yet
**Steps**:
1. Use the "All Lecturers" option
2. Apply a status filter for "new" or "opened"
3. Manually review for complaints without assignment

**Note**: A dedicated "Unassigned" option could be added in future iterations

### Use Case 4: Combine with Priority Filter
**Scenario**: A lecturer wants to see high-priority complaints assigned to them
**Steps**:
1. Select their name in "Assigned To" dropdown
2. Check "High" and "Critical" in the Priority filter
3. View filtered results

**Expected Result**: Only high and critical priority complaints assigned to that lecturer

## Visual States

### Default State
```
┌─────────────────────────────┐
│ Assigned To                 │
│ ┌─────────────────────────┐ │
│ │ All Lecturers        ▼  │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### Lecturer Selected
```
┌─────────────────────────────┐
│ Assigned To                 │
│ ┌─────────────────────────┐ │
│ │ Dr. Smith            ▼  │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘

Active Filters:
┌──────────────────────┐
│ Assigned: Dr. Smith ✕│
└──────────────────────┘
```

### Dropdown Expanded
```
┌─────────────────────────────┐
│ Assigned To                 │
│ ┌─────────────────────────┐ │
│ │ Dr. Smith            ▼  │ │
│ ├─────────────────────────┤ │
│ │ All Lecturers           │ │
│ │ Dr. Smith          ✓    │ │
│ │ Prof. Johnson           │ │
│ │ Admin Davis             │ │
│ │ Admin Wilson            │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

## Implementation Details

### Data Structure
```typescript
interface FilterState {
  // ... other filters
  assignedTo: string; // Lecturer/admin user ID or empty string
}

interface Lecturer {
  id: string;      // User ID
  name: string;    // Display name
}
```

### Filter Logic
```typescript
// Apply assigned lecturer filter
if (filters.assignedTo) {
  complaints = complaints.filter(
    (complaint) => complaint.assigned_to === filters.assignedTo
  );
}
```

### Active Filter Chip
```typescript
{filters.assignedTo && (
  <FilterChip
    label={`Assigned: ${
      availableLecturers.find((l) => l.id === filters.assignedTo)?.name || 
      filters.assignedTo
    }`}
    onRemove={() => onFiltersChange({ ...filters, assignedTo: '' })}
  />
)}
```

## Accessibility

- **Keyboard Navigation**: Dropdown is fully keyboard accessible
- **Screen Readers**: Proper labels and ARIA attributes
- **Focus Management**: Clear focus indicators on dropdown and options

## Testing Scenarios

### Test 1: Filter by Single Lecturer
- Select "Dr. Smith" from dropdown
- Verify only complaints with `assigned_to: 'lecturer-1'` are shown
- Verify active filter chip displays "Assigned: Dr. Smith"

### Test 2: Clear Filter
- Select a lecturer
- Click X on the active filter chip
- Verify dropdown resets to "All Lecturers"
- Verify all complaints are shown again

### Test 3: Combine with Status Filter
- Select "Dr. Smith" from assigned to dropdown
- Select "In Progress" status
- Verify only in-progress complaints assigned to Dr. Smith are shown

### Test 4: No Results
- Select a lecturer with no assigned complaints
- Verify empty state is displayed
- Verify appropriate message is shown

## Future Enhancements

1. **Unassigned Filter**: Add explicit "Unassigned" option to find complaints without assignment
2. **Multi-Select**: Allow filtering by multiple lecturers at once
3. **Quick Filters**: Add "Assigned to Me" quick filter button
4. **Assignment Count**: Show number of assigned complaints next to each lecturer name
5. **Department Grouping**: Group lecturers by department in dropdown
6. **Search in Dropdown**: Add search functionality for large lecturer lists

## Related Components
- `FilterPanel` - Main filter component
- `FilterChip` - Active filter display
- `ComplaintList` - Displays filtered results
- `FilterState` - Type definition for filter state

## Related Requirements
- **AC13**: Search and Advanced Filtering
- **AC17**: Complaint Assignment
- **Task 4.2**: Build Advanced Filter System

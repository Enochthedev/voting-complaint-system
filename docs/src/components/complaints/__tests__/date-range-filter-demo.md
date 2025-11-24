# Date Range Filter - Visual Demo

## Overview
The date range filter allows users to filter complaints by their creation date. Users can specify a "from" date, a "to" date, or both to create a date range.

## Location
- **Component**: `FilterPanel` in `src/components/complaints/filter-panel.tsx`
- **Usage**: Complaints page (`src/app/complaints/page.tsx`)

## Features

### 1. From Date Filter
- **Purpose**: Filter complaints created on or after a specific date
- **Input**: Date picker (HTML5 date input)
- **Behavior**: 
  - Includes complaints created on the selected date
  - Includes all complaints after the selected date
  - When cleared, removes the from date restriction

### 2. To Date Filter
- **Purpose**: Filter complaints created on or before a specific date
- **Input**: Date picker (HTML5 date input)
- **Behavior**:
  - Includes the entire day of the selected date (up to 23:59:59.999)
  - Includes all complaints before the selected date
  - When cleared, removes the to date restriction

### 3. Date Range Filter
- **Purpose**: Filter complaints within a specific date range
- **Behavior**:
  - Combines both from and to date filters
  - Inclusive of both boundary dates
  - Can be used to filter for a single day by setting both dates to the same value

## Visual States

### Default State
```
┌─────────────────────────────────┐
│ Date Range                    ▼ │
├─────────────────────────────────┤
│ From                            │
│ ┌─────────────────────────────┐ │
│ │ [Select date...]            │ │
│ └─────────────────────────────┘ │
│                                 │
│ To                              │
│ ┌─────────────────────────────┐ │
│ │ [Select date...]            │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### With From Date Selected
```
┌─────────────────────────────────┐
│ Date Range                    ▼ │
├─────────────────────────────────┤
│ From                            │
│ ┌─────────────────────────────┐ │
│ │ 2024-11-13                  │ │
│ └─────────────────────────────┘ │
│                                 │
│ To                              │
│ ┌─────────────────────────────┐ │
│ │ [Select date...]            │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

Active Filters:
┌──────────────────┐
│ From: 2024-11-13 │ ×
└──────────────────┘
```

### With Date Range Selected
```
┌─────────────────────────────────┐
│ Date Range                    ▼ │
├─────────────────────────────────┤
│ From                            │
│ ┌─────────────────────────────┐ │
│ │ 2024-11-13                  │ │
│ └─────────────────────────────┘ │
│                                 │
│ To                              │
│ ┌─────────────────────────────┐ │
│ │ 2024-11-20                  │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

Active Filters:
┌──────────────────┐ ┌────────────────┐
│ From: 2024-11-13 │ │ To: 2024-11-20 │ ×
└──────────────────┘ └────────────────┘
```

## User Interactions

### Selecting a From Date
1. Click on the "From" date input field
2. Browser's native date picker opens
3. Select a date
4. Filter is immediately applied
5. Active filter chip appears below the filter panel
6. Complaint list updates to show only complaints from that date onwards

### Selecting a To Date
1. Click on the "To" date input field
2. Browser's native date picker opens
3. Select a date
4. Filter is immediately applied
5. Active filter chip appears below the filter panel
6. Complaint list updates to show only complaints up to and including that date

### Creating a Date Range
1. Select a "From" date
2. Select a "To" date
3. Both filters are applied simultaneously
4. Two active filter chips appear
5. Complaint list shows only complaints within the date range

### Removing Date Filters
**Option 1: Clear individual date**
- Click the × on the active filter chip
- That specific date filter is removed
- Complaint list updates

**Option 2: Clear date input**
- Click on the date input field
- Delete the date value
- Filter is removed

**Option 3: Clear all filters**
- Click "Clear All" button in filter panel header
- All filters including date range are removed

## Filter Logic

### From Date Logic
```typescript
if (filters.dateFrom) {
  const fromDate = new Date(filters.dateFrom);
  complaints = complaints.filter(
    (complaint) => new Date(complaint.created_at) >= fromDate
  );
}
```

### To Date Logic
```typescript
if (filters.dateTo) {
  const toDate = new Date(filters.dateTo);
  toDate.setHours(23, 59, 59, 999); // Include the entire day
  complaints = complaints.filter(
    (complaint) => new Date(complaint.created_at) <= toDate
  );
}
```

## Use Cases

### 1. View Recent Complaints
- Set "From" date to 7 days ago
- Leave "To" date empty
- See all complaints from the last week

### 2. View Complaints for a Specific Period
- Set "From" date to start of month
- Set "To" date to end of month
- See all complaints for that month

### 3. View Complaints for a Single Day
- Set both "From" and "To" to the same date
- See all complaints created on that specific day

### 4. View Historical Complaints
- Leave "From" date empty
- Set "To" date to a past date
- See all complaints up to that date

## Accessibility

- **Keyboard Navigation**: Date inputs are fully keyboard accessible
- **Screen Readers**: Labels are properly associated with inputs
- **Focus Indicators**: Clear focus states on date inputs
- **Native Date Picker**: Uses browser's native date picker for best accessibility

## Responsive Design

- **Desktop**: Date inputs displayed vertically with full width
- **Tablet**: Same layout as desktop
- **Mobile**: Date inputs stack vertically, full width for easy touch interaction

## Integration with Other Filters

The date range filter works seamlessly with other filters:
- **Status Filter**: Show only "new" complaints from last week
- **Category Filter**: Show only "facilities" complaints from last month
- **Priority Filter**: Show only "high" priority complaints from today
- **Combined**: All filters can be used together for precise filtering

## Performance Considerations

- **Client-side Filtering**: Date filtering happens in the browser for mock data
- **Future API Integration**: Will be optimized with database queries
- **Instant Updates**: Filter changes immediately update the complaint list
- **No Debouncing**: Date selection is a discrete action, no need for debouncing

## Testing

Comprehensive tests cover:
- ✅ No date filter (returns all complaints)
- ✅ From date only
- ✅ To date only
- ✅ Date range (both from and to)
- ✅ Single day filtering
- ✅ Edge cases (midnight boundaries, same day)
- ✅ Integration with other filters
- ✅ Empty results
- ✅ Array immutability

See `date-range-filter.test.tsx` for full test suite.

# Filter Panel - Visual Guide

## Overview

The Filter Panel is a comprehensive filtering interface for the Student Complaint System. This guide provides visual descriptions and usage examples.

## Component Structure

```
┌─────────────────────────────────────┐
│ 🔍 Filters                    [3]   │  ← Header with filter count badge
│ [Clear All] [▼]                     │  ← Actions (Clear All, Collapse)
├─────────────────────────────────────┤
│                                     │
│ ▼ Status                            │  ← Expandable section
│   ☐ New                             │
│   ☑ Opened                          │  ← Checked filter
│   ☐ In Progress                     │
│   ☑ Resolved                        │  ← Checked filter
│   ☐ Closed                          │
│   ☐ Reopened                        │
│                                     │
│ ▼ Category                          │
│   ☑ Academic                        │  ← Checked filter
│   ☐ Facilities                      │
│   ☐ Harassment                      │
│   ☐ Course Content                  │
│   ☐ Administrative                  │
│   ☐ Other                           │
│                                     │
│ ▼ Priority                          │
│   ☐ Low                             │
│   ☐ Medium                          │
│   ☐ High                            │
│   ☐ Critical                        │
│                                     │
│ ▼ Date Range                        │
│   From: [2024-01-01]                │  ← Date input
│   To:   [2024-12-31]                │  ← Date input
│                                     │
│ ▼ Tags                              │
│   ☐ wifi-issue                      │
│   ☐ classroom                       │
│   ☐ urgent                          │
│   ☐ library                         │
│   ... (scrollable)                  │
│                                     │
│ ▼ Assigned To                       │
│   [Select Lecturer ▼]               │  ← Dropdown
│                                     │
│ ▼ Sort By                           │
│   [Date Created ▼]                  │  ← Sort field dropdown
│   [Ascending] [Descending]          │  ← Sort order buttons
│                                     │
│ ─────────────────────────────────── │
│ [💾 Save Filter Preset]             │  ← Save preset button
│                                     │
├─────────────────────────────────────┤
│ Active Filters                      │  ← Active filters section
│ [Status: Opened ✕]                  │  ← Removable chip
│ [Status: Resolved ✕]                │
│ [Category: Academic ✕]              │
└─────────────────────────────────────┘
```

## Visual States

### 1. Default State (No Filters)

```
┌─────────────────────────────────────┐
│ 🔍 Filters                          │
│ [▼]                                 │
├─────────────────────────────────────┤
│ ▼ Status                            │
│   ☐ New                             │
│   ☐ Opened                          │
│   ☐ In Progress                     │
│   ...                               │
└─────────────────────────────────────┘
```

### 2. With Active Filters

```
┌─────────────────────────────────────┐
│ 🔍 Filters                    [3]   │  ← Badge shows count
│ [Clear All] [▼]                     │  ← Clear All appears
├─────────────────────────────────────┤
│ ▼ Status                            │
│   ☐ New                             │
│   ☑ Opened                          │  ← Checked
│   ☐ In Progress                     │
│   ...                               │
├─────────────────────────────────────┤
│ Active Filters                      │
│ [Status: Opened ✕]                  │  ← Chips appear
│ [Category: Academic ✕]              │
│ [Priority: High ✕]                  │
└─────────────────────────────────────┘
```

### 3. Collapsed State

```
┌─────────────────────────────────────┐
│ 🔍 Filters                    [5]   │
│ [Clear All] [▶]                     │  ← Expand arrow
└─────────────────────────────────────┘
```

### 4. Save Preset Mode

```
┌─────────────────────────────────────┐
│ ...filters...                       │
├─────────────────────────────────────┤
│ [Preset name...          ]          │  ← Input field
│ [Save] [Cancel]                     │  ← Action buttons
└─────────────────────────────────────┘
```

## Filter Sections

### Status Filter

Visual representation of complaint statuses with checkboxes:

```
▼ Status
  ☐ New          - Newly submitted complaints
  ☐ Opened       - Complaints opened by lecturer
  ☐ In Progress  - Complaints being worked on
  ☐ Resolved     - Complaints marked as resolved
  ☐ Closed       - Complaints closed
  ☐ Reopened     - Complaints reopened by student
```

### Category Filter

Visual representation of complaint categories:

```
▼ Category
  ☐ Academic           - Academic-related issues
  ☐ Facilities         - Facility problems
  ☐ Harassment         - Harassment complaints
  ☐ Course Content     - Course content issues
  ☐ Administrative     - Administrative problems
  ☐ Other              - Other complaints
```

### Priority Filter

Visual representation of priority levels:

```
▼ Priority
  ☐ Low       - Low priority issues
  ☐ Medium    - Medium priority issues
  ☐ High      - High priority issues
  ☐ Critical  - Critical issues requiring immediate attention
```

### Date Range Filter

Visual representation of date range inputs:

```
▼ Date Range
  From: [📅 2024-01-01]  ← Date picker
  To:   [📅 2024-12-31]  ← Date picker
```

### Tag Filter

Visual representation with scrollable list:

```
▼ Tags
  ┌─────────────────┐
  │ ☐ wifi-issue    │
  │ ☐ classroom     │
  │ ☐ urgent        │
  │ ☐ library       │
  │ ☐ parking       │
  │ ☐ cafeteria     │  ← Scrollable
  │ ☐ equipment     │
  │ ☐ schedule      │
  │ ...             │
  └─────────────────┘
```

### Assigned Lecturer Filter

Visual representation of lecturer dropdown:

```
▼ Assigned To
  ┌─────────────────────────┐
  │ All Lecturers        ▼  │  ← Dropdown
  └─────────────────────────┘
  
  When opened:
  ┌─────────────────────────┐
  │ All Lecturers           │
  │ Dr. John Smith          │
  │ Prof. Sarah Johnson     │
  │ Dr. Michael Brown       │
  │ Prof. Emily Davis       │
  └─────────────────────────┘
```

### Sort Options

Visual representation of sort controls:

```
▼ Sort By
  ┌─────────────────────────┐
  │ Date Created         ▼  │  ← Sort field dropdown
  └─────────────────────────┘
  
  ┌──────────────┬──────────────┐
  │ Ascending    │ Descending   │  ← Toggle buttons
  └──────────────┴──────────────┘
  
  Sort options:
  - Date Created
  - Last Updated
  - Priority
  - Status
  - Title
```

## Active Filter Chips

Visual representation of filter chips:

```
Active Filters
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Status: New   ✕  │ │ Priority: High ✕ │ │ Tag: urgent   ✕  │
└──────────────────┘ └──────────────────┘ └──────────────────┘

Chip states:
- Default: Gray background
- Hover: Darker background
- Click X: Removes filter
```

## Interaction Patterns

### 1. Selecting a Filter

```
User clicks checkbox → Filter added to state → Chip appears → List updates
```

### 2. Removing a Filter (via chip)

```
User clicks X on chip → Filter removed from state → Chip disappears → List updates
```

### 3. Removing a Filter (via checkbox)

```
User unchecks checkbox → Filter removed from state → Chip disappears → List updates
```

### 4. Clear All Filters

```
User clicks "Clear All" → All filters reset → All chips disappear → List shows all
```

### 5. Collapse/Expand Panel

```
User clicks collapse button → Panel collapses → Only header visible
User clicks expand button → Panel expands → All filters visible
```

### 6. Save Preset

```
User clicks "Save Filter Preset" → Input field appears
User types preset name → User clicks "Save"
Preset saved → Input field disappears → Success message
```

## Responsive Behavior

### Desktop (≥1024px)

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│  ┌──────────────┐  ┌──────────────────────────────┐  │
│  │              │  │                              │  │
│  │   Filter     │  │     Complaint List           │  │
│  │   Panel      │  │                              │  │
│  │              │  │     [Complaint 1]            │  │
│  │   [Filters]  │  │     [Complaint 2]            │  │
│  │              │  │     [Complaint 3]            │  │
│  │              │  │                              │  │
│  └──────────────┘  └──────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Tablet (768px - 1023px)

```
┌────────────────────────────────────┐
│                                    │
│  ┌──────────────────────────────┐ │
│  │   Filter Panel (Collapsed)   │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │   Complaint List             │ │
│  │   [Complaint 1]              │ │
│  │   [Complaint 2]              │ │
│  └──────────────────────────────┘ │
│                                    │
└────────────────────────────────────┘
```

### Mobile (<768px)

```
┌──────────────────┐
│                  │
│ ┌──────────────┐ │
│ │ Filters [3]  │ │  ← Collapsed by default
│ └──────────────┘ │
│                  │
│ ┌──────────────┐ │
│ │ Complaint 1  │ │
│ └──────────────┘ │
│                  │
│ ┌──────────────┐ │
│ │ Complaint 2  │ │
│ └──────────────┘ │
│                  │
└──────────────────┘
```

## Color Scheme

### Light Mode

- Background: White (#FFFFFF)
- Border: Zinc-200 (#E4E4E7)
- Text: Zinc-900 (#18181B)
- Checkbox: Zinc-900 (#18181B)
- Active chip: Zinc-100 (#F4F4F5)
- Hover: Zinc-100 (#F4F4F5)

### Dark Mode

- Background: Zinc-950 (#09090B)
- Border: Zinc-800 (#27272A)
- Text: Zinc-50 (#FAFAFA)
- Checkbox: Zinc-50 (#FAFAFA)
- Active chip: Zinc-800 (#27272A)
- Hover: Zinc-800 (#27272A)

## Accessibility Features

1. **Keyboard Navigation**
   - Tab through all interactive elements
   - Enter/Space to toggle checkboxes
   - Arrow keys in dropdowns

2. **Screen Reader Support**
   - Proper ARIA labels
   - Descriptive button text
   - Status announcements

3. **Focus Indicators**
   - Visible focus rings
   - High contrast focus states

4. **Color Contrast**
   - WCAG AA compliant
   - Sufficient contrast ratios

## Usage Examples

### Example 1: Filter by Status and Priority

```
1. User opens filter panel
2. User checks "Opened" under Status
3. User checks "High" under Priority
4. Complaint list updates to show only opened, high-priority complaints
5. Two chips appear: "Status: Opened" and "Priority: High"
```

### Example 2: Filter by Date Range

```
1. User expands "Date Range" section
2. User selects "From: 2024-01-01"
3. User selects "To: 2024-01-31"
4. Complaint list updates to show complaints from January 2024
5. Two chips appear: "From: 2024-01-01" and "To: 2024-01-31"
```

### Example 3: Save and Load Preset

```
1. User applies multiple filters (status, category, priority)
2. User clicks "Save Filter Preset"
3. User types "High Priority Academic Issues"
4. User clicks "Save"
5. Preset is saved
6. Later, user loads preset from saved list
7. All filters are reapplied instantly
```

## Integration with Complaint List

The filter panel works seamlessly with the complaint list:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────────────┐  ┌───────────────────────────────┐  │
│  │ Filter Panel │  │ Complaint List                │  │
│  │              │  │                               │  │
│  │ Status:      │  │ Showing 15 complaints         │  │
│  │ ☑ Opened     │  │                               │  │
│  │              │  │ ┌───────────────────────────┐ │  │
│  │ Priority:    │  │ │ [Opened] [High]           │ │  │
│  │ ☑ High       │  │ │ WiFi not working          │ │  │
│  │              │  │ │ Academic • 2 hours ago    │ │  │
│  │              │  │ └───────────────────────────┘ │  │
│  │              │  │                               │  │
│  │              │  │ ┌───────────────────────────┐ │  │
│  │              │  │ │ [Opened] [High]           │ │  │
│  │              │  │ │ Broken projector          │ │  │
│  │              │  │ │ Facilities • 3 hours ago  │ │  │
│  │              │  │ └───────────────────────────┘ │  │
│  │              │  │                               │  │
│  └──────────────┘  └───────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Performance Considerations

1. **Debouncing**: Filter changes are debounced to avoid excessive API calls
2. **Lazy Loading**: Tags and lecturers are loaded on demand
3. **Memoization**: Filter state is memoized to prevent unnecessary re-renders
4. **Virtual Scrolling**: Long tag lists use virtual scrolling for performance

## Best Practices

1. **Start Simple**: Begin with commonly used filters (status, priority)
2. **Progressive Disclosure**: Hide advanced filters until needed
3. **Clear Feedback**: Show filter count and active chips
4. **Easy Reset**: Provide clear "Clear All" option
5. **Save Presets**: Allow users to save frequently used filter combinations
6. **Responsive Design**: Ensure filters work well on all screen sizes
7. **Accessibility**: Maintain keyboard navigation and screen reader support

## Related Documentation

- [Filter Panel Component README](../src/components/complaints/README_FILTER_PANEL.md)
- [Complaint List Visual Guide](./COMPLAINT_LIST_VISUAL_GUIDE.md)
- [Search Bar Visual Guide](./SEARCH_BAR_VISUAL_GUIDE.md)

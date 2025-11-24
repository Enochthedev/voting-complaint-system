# Complaint List Component - Visual Guide

## Overview

The Complaint List component displays complaints in a clean, organized card-based layout with full pagination support.

## Component Layout

```
┌─────────────────────────────────────────────────────────────┐
│  My Complaints                          [+ New Complaint]   │
│  View and manage your submitted complaints                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Broken Air Conditioning in Lecture Hall A   [New]  │    │
│  │                                                     │    │
│  │ The air conditioning system in Lecture Hall A...   │    │
│  │                                                     │    │
│  │ ● High  📄 Facilities  2 hours ago                 │    │
│  │ [air-conditioning] [lecture-hall] [urgent]         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Unfair Grading in CS101              [Opened]      │    │
│  │                                                     │    │
│  │ I believe the grading criteria for the recent...   │    │
│  │                                                     │    │
│  │ ● Medium  📄 Academic  1 day ago  [Anonymous]      │    │
│  │ [grading] [cs101]                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Library WiFi Connection Issues   [In Progress]     │    │
│  │                                                     │    │
│  │ The WiFi in the library keeps disconnecting...     │    │
│  │                                                     │    │
│  │ ● Medium  📄 Facilities  3 days ago                │    │
│  │ [wifi] [library] [connectivity]                    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ... more complaints ...                                    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Page 1 of 2              [← Previous]  [Next →]           │
└─────────────────────────────────────────────────────────────┘
```

## Card Components

### Complaint Card Structure

```
┌──────────────────────────────────────────────────────┐
│ Title                                    [Status]     │  ← Header
│                                                       │
│ Description preview (first 150 chars)...             │  ← Preview
│                                                       │
│ ● Priority  📄 Category  Timestamp  [Anonymous]      │  ← Metadata
│ [tag1] [tag2] [tag3] [+2 more]                      │  ← Tags
└──────────────────────────────────────────────────────┘
```

### Status Badges

```
[Draft]        - Gray background
[New]          - Blue background
[Opened]       - Purple background
[In Progress]  - Yellow background
[Resolved]     - Green background
[Closed]       - Gray background
[Reopened]     - Orange background
```

### Priority Indicators

```
● Low       - Blue dot
● Medium    - Yellow dot
● High      - Orange dot
● Critical  - Red dot
```

## States

### 1. Loading State

```
┌──────────────────────────────────────────────────────┐
│ ████████████████████████          ████████           │
│                                                       │
│ ████████████████████████████████████████████         │
│                                                       │
│ ████████  ████████████  ████████                     │
└──────────────────────────────────────────────────────┘
```
*Skeleton loading placeholders with pulse animation*

### 2. Empty State

```
┌──────────────────────────────────────────────────────┐
│                                                       │
│                      📄                               │
│                                                       │
│              No complaints found                      │
│                                                       │
│    No complaints to display. Submit your first       │
│         complaint to get started.                    │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### 3. Error State

```
┌──────────────────────────────────────────────────────┐
│                                                       │
│                      ⚠️                               │
│                                                       │
│           Error loading complaints                    │
│                                                       │
│    Failed to load complaints. Please try again.      │
│                                                       │
└──────────────────────────────────────────────────────┘
```

## Pagination

### Desktop View

```
┌──────────────────────────────────────────────────────┐
│ Page 1 of 5              [← Previous]  [Next →]     │
└──────────────────────────────────────────────────────┘
```

### Mobile View

```
┌──────────────────────────────────────────────────────┐
│         [Previous]              [Next]                │
└──────────────────────────────────────────────────────┘
```

## Interactive Elements

### Hover State

```
┌──────────────────────────────────────────────────────┐
│ Title                                    [Status]     │  ← Darker text
│                                                       │  ← Shadow appears
│ Description preview...                               │  ← Border darkens
│                                                       │
│ ● Priority  📄 Category  Timestamp                   │
│ [tag1] [tag2] [tag3]                                │
└──────────────────────────────────────────────────────┘
```
*Cursor changes to pointer, card elevates with shadow*

## Responsive Behavior

### Desktop (> 1024px)
- Full card layout
- All metadata visible
- Desktop pagination with page numbers

### Tablet (640px - 1024px)
- Slightly condensed cards
- All features visible
- Adaptive pagination

### Mobile (< 640px)
- Stacked layout
- Simplified pagination
- Tags may wrap to multiple lines
- Smaller text sizes

## Color Scheme

### Light Mode
- Background: White cards on light gray background
- Text: Dark gray on white
- Borders: Light gray
- Hover: Darker borders, subtle shadow

### Dark Mode
- Background: Dark cards on darker background
- Text: Light gray on dark
- Borders: Dark gray
- Hover: Lighter borders, subtle shadow

## Accessibility Features

1. **Semantic HTML**: Proper heading hierarchy
2. **ARIA Labels**: Priority indicators have descriptive labels
3. **Keyboard Navigation**: All interactive elements are keyboard accessible
4. **Color Contrast**: WCAG AA compliant
5. **Screen Reader Support**: Meaningful text for all visual elements

## Usage Examples

### Basic Usage

```tsx
<ComplaintList
  complaints={complaints}
  onComplaintClick={(id) => router.push(`/complaints/${id}`)}
/>
```

### With Pagination

```tsx
<ComplaintList
  complaints={currentPageComplaints}
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
  showPagination={true}
/>
```

### With Loading State

```tsx
<ComplaintList
  complaints={[]}
  isLoading={true}
/>
```

### With Error State

```tsx
<ComplaintList
  complaints={[]}
  error="Failed to load complaints"
/>
```

### With Custom Empty Message

```tsx
<ComplaintList
  complaints={[]}
  emptyMessage="You haven't submitted any complaints yet."
/>
```

## Performance Optimizations

1. **Pagination**: Limits rendered items (default 5 per page)
2. **Efficient Rendering**: React keys for optimal updates
3. **Lazy Loading**: Ready for infinite scroll implementation
4. **Skeleton Loading**: Improves perceived performance

## Future Enhancements (Phase 12)

1. Real-time updates via Supabase Realtime
2. Infinite scroll option
3. Advanced filtering UI
4. Search integration
5. Bulk selection
6. Export functionality
7. Sort options

## Testing Checklist

- [ ] All status badges display correctly
- [ ] Priority indicators show proper colors
- [ ] Pagination works (Previous/Next)
- [ ] Loading state displays skeleton
- [ ] Empty state shows message
- [ ] Error state displays error
- [ ] Cards are clickable
- [ ] Hover effects work
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop
- [ ] Dark mode works
- [ ] Tags display correctly
- [ ] Anonymous badge shows when needed
- [ ] Timestamps format correctly
- [ ] Smooth scrolling on page change

## Browser Support

✅ Chrome/Edge (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ Mobile Safari (iOS 14+)
✅ Chrome Mobile (Android)

## Notes

- Component uses mock data for UI development
- No API calls in current implementation
- Ready for Phase 12 API integration
- Follows project design patterns
- TypeScript fully typed
- No external dependencies beyond project standards

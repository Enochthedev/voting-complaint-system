# Complaint List Visual Demo

## How to Test

1. Start the development server:
   ```bash
   cd student-complaint-system
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/complaints`

## What to Verify

### ✅ Complaint List Display
- [ ] Complaints are displayed in card format
- [ ] Each card shows title, description preview, and metadata
- [ ] Status badges are visible with correct colors
- [ ] Priority indicators show colored dots
- [ ] Category labels are displayed
- [ ] Timestamps show relative time (e.g., "2 hours ago")
- [ ] Anonymous complaints show "Anonymous" badge
- [ ] Tags are displayed (max 5 visible, "+X more" for additional)

### ✅ Status Badge Colors
- [ ] Draft: Gray
- [ ] New: Blue
- [ ] Opened: Purple
- [ ] In Progress: Yellow
- [ ] Resolved: Green
- [ ] Closed: Gray
- [ ] Reopened: Orange

### ✅ Priority Indicators
- [ ] Low: Blue dot
- [ ] Medium: Yellow dot
- [ ] High: Orange dot
- [ ] Critical: Red dot

### ✅ Pagination
- [ ] Page numbers are displayed correctly
- [ ] "Previous" button is disabled on first page
- [ ] "Next" button is disabled on last page
- [ ] Clicking pagination buttons changes the displayed complaints
- [ ] Page changes trigger loading state
- [ ] Smooth scroll to top on page change

### ✅ Interactive Elements
- [ ] Hover effect on complaint cards
- [ ] Cards show pointer cursor on hover
- [ ] "New Complaint" button navigates to form

### ✅ Responsive Design
- [ ] Mobile view: Simplified pagination
- [ ] Desktop view: Full pagination controls
- [ ] Cards adapt to screen size
- [ ] Tags wrap properly on small screens

### ✅ Loading State
To test loading state:
1. Click pagination buttons
2. Observe skeleton loading for 500ms
3. Verify smooth transition to content

### ✅ Empty State
To test empty state:
1. Modify mock data to return empty array
2. Verify empty state message displays
3. Check icon and text are centered

### ✅ Error State
To test error state:
1. Pass error prop to component
2. Verify error message displays
3. Check error icon and styling

## Mock Data Scenarios

The demo page includes 8 complaints with:
- Various statuses (new, opened, in_progress, resolved)
- Different priorities (low, medium, high, critical)
- Multiple categories (facilities, academic, harassment, etc.)
- Mix of anonymous and non-anonymous
- Different timestamps (30 min to 10 days ago)
- Various tags

## Expected Behavior

1. **Initial Load**: Shows first 5 complaints
2. **Page 2**: Shows next 3 complaints
3. **Pagination**: 2 pages total (8 complaints, 5 per page)
4. **Click Complaint**: Logs complaint ID to console (detail page not yet implemented)
5. **New Complaint Button**: Navigates to `/complaints/new`

## Browser Testing

Test in:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (responsive view)

## Accessibility Testing

- [ ] Tab navigation works
- [ ] Screen reader announces complaint information
- [ ] ARIA labels are present
- [ ] Color contrast meets WCAG standards

## Performance

- [ ] Page loads quickly
- [ ] Pagination is smooth
- [ ] No layout shifts
- [ ] Images/icons load properly

## Notes

- This is UI-only implementation with mock data
- No API calls are made
- Role-based filtering logic is prepared but uses mock data
- Ready for Phase 12 API integration

# Loading Skeletons - Visual Test Guide

## Purpose

This guide helps you visually verify that all loading skeleton components are working correctly across the application.

## Test Procedure

### 1. Dashboard Page

**URL**: `/dashboard`

**Steps**:

1. Clear browser cache or use incognito mode
2. Navigate to `/dashboard`
3. Observe the loading state

**Expected Result**:

- ✅ Should see `DashboardGridSkeleton` with:
  - 4 metric cards in a grid (responsive: 1 col mobile, 2 cols tablet, 4 cols desktop)
  - 2 content cards below in a grid
  - Smooth pulse animation
  - Proper spacing and borders

**Screenshot Opportunity**: Dashboard loading state

---

### 2. Notifications Page

**URL**: `/notifications`

**Steps**:

1. Navigate to `/notifications`
2. Observe the loading state

**Expected Result**:

- ✅ Should see `NotificationListSkeleton` with:
  - 5 notification items
  - Each item has circular avatar skeleton and text lines
  - Items separated by borders
  - Contained in a card

**Screenshot Opportunity**: Notifications loading state

---

### 3. Votes Page

**URL**: `/votes`

**Steps**:

1. Navigate to `/votes`
2. Observe the loading state

**Expected Result**:

- ✅ Should see 4 `VoteCardSkeleton` components in a grid:
  - 2 columns on desktop
  - 1 column on mobile
  - Each card shows title, description, and option skeletons
  - Footer with metadata skeletons

**Screenshot Opportunity**: Votes loading state

---

### 4. Complaint Detail Page

**URL**: `/complaints/[any-id]`

**Steps**:

1. Navigate to any complaint detail page
2. Observe the loading state (may be brief)

**Expected Result**:

- ✅ Should see `ComplaintDetailSkeleton` with:
  - Header section with title and badges
  - Action buttons row
  - Main content grid (2/3 width on desktop)
    - Description card
    - Attachments card
    - Comments card
  - Sidebar (1/3 width on desktop)
    - Timeline card

**Screenshot Opportunity**: Complaint detail loading state

---

### 5. New Complaint Form

**URL**: `/complaints/new`

**Steps**:

1. Navigate to `/complaints/new`
2. If loading a draft, observe the loading state

**Expected Result**:

- ✅ Should see `FormSkeleton` with:
  - Multiple form field skeletons
  - Label and input pairs
  - Grid layout for some fields
  - Action buttons at bottom

**Screenshot Opportunity**: Form loading state

---

### 6. Announcements Page

**URL**: `/announcements`

**Steps**:

1. Navigate to `/announcements`
2. Observe the loading state

**Expected Result**:

- ✅ Should see 3 `AnnouncementCardSkeleton` components:
  - Each card has header with title and icon
  - Content area skeleton
  - Proper spacing between cards

**Screenshot Opportunity**: Announcements loading state

---

### 7. Drafts Page

**URL**: `/complaints/drafts`

**Steps**:

1. Navigate to `/complaints/drafts`
2. Observe the loading state

**Expected Result**:

- ✅ Should see 3 `ComplaintCardSkeleton` components:
  - Each matches complaint list item structure
  - Header with title and status badge
  - Description preview
  - Metadata row with priority, category, date

**Screenshot Opportunity**: Drafts loading state

---

## Responsive Testing

### Mobile View (< 768px)

Test each page on mobile viewport:

- [ ] Dashboard - Cards stack vertically
- [ ] Notifications - Full width items
- [ ] Votes - Single column grid
- [ ] Complaint Detail - Sidebar moves below content
- [ ] Forms - Full width fields
- [ ] Announcements - Full width cards
- [ ] Drafts - Full width cards

### Tablet View (768px - 1024px)

Test each page on tablet viewport:

- [ ] Dashboard - 2 column grid for metrics
- [ ] Votes - 2 column grid
- [ ] Complaint Detail - Sidebar still below on smaller tablets
- [ ] All other pages - Appropriate responsive behavior

### Desktop View (> 1024px)

Test each page on desktop viewport:

- [ ] Dashboard - 4 column grid for metrics
- [ ] Votes - 2 column grid
- [ ] Complaint Detail - 3 column grid with sidebar
- [ ] All pages - Optimal spacing and layout

---

## Animation Testing

### Pulse Animation

For each skeleton component:

- [ ] Verify smooth pulse animation
- [ ] Animation should be subtle, not distracting
- [ ] Animation should loop continuously
- [ ] No janky or stuttering animations

### Transition to Content

When content loads:

- [ ] Smooth fade-in of actual content
- [ ] No layout shift or jumping
- [ ] Content appears in same position as skeleton
- [ ] No flash of unstyled content

---

## Dark Mode Testing

Test all skeletons in dark mode:

- [ ] Dashboard skeletons
- [ ] Notification skeletons
- [ ] Vote skeletons
- [ ] Complaint detail skeletons
- [ ] Form skeletons
- [ ] Announcement skeletons
- [ ] Draft skeletons

**Expected Result**:

- ✅ Skeletons use `bg-muted` which adapts to dark mode
- ✅ Proper contrast in both light and dark modes
- ✅ No harsh white or black backgrounds

---

## Performance Testing

### Load Time Perception

- [ ] Skeletons appear immediately (< 100ms)
- [ ] No delay before skeleton shows
- [ ] Skeleton improves perceived performance
- [ ] Users understand content is loading

### Actual Performance

- [ ] Skeletons don't slow down page load
- [ ] No additional network requests
- [ ] Minimal JavaScript execution
- [ ] Smooth rendering on low-end devices

---

## Accessibility Testing

### Screen Reader Testing

- [ ] Skeletons don't announce confusing information
- [ ] Loading states are communicated
- [ ] Focus management works correctly
- [ ] No keyboard traps in skeleton state

### Keyboard Navigation

- [ ] Can't interact with skeleton elements
- [ ] Focus moves correctly when content loads
- [ ] No tab stops on skeleton elements

---

## Browser Compatibility

Test skeletons in:

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Expected Result**:

- ✅ Consistent appearance across browsers
- ✅ Animations work in all browsers
- ✅ No layout issues

---

## Common Issues to Check

### Layout Issues

- [ ] No horizontal scrolling
- [ ] Proper spacing and padding
- [ ] Correct border radius
- [ ] Aligned with actual content

### Animation Issues

- [ ] No flickering
- [ ] Smooth pulse effect
- [ ] Consistent timing
- [ ] No performance issues

### Content Mismatch

- [ ] Skeleton structure matches actual content
- [ ] Similar heights and widths
- [ ] Same number of items
- [ ] Proper grid/flex layouts

---

## Success Criteria

All tests pass when:

- ✅ All 7 pages show appropriate skeletons
- ✅ Skeletons match actual content structure
- ✅ Responsive behavior works correctly
- ✅ Animations are smooth and subtle
- ✅ Dark mode works properly
- ✅ No accessibility issues
- ✅ Cross-browser compatibility confirmed
- ✅ Performance is not impacted

---

## Notes

### Simulating Slow Network

To better observe skeletons:

1. Open Chrome DevTools
2. Go to Network tab
3. Select "Slow 3G" or "Fast 3G" throttling
4. Reload pages to see skeletons longer

### Testing Tips

- Use incognito/private mode to avoid cache
- Clear browser cache between tests
- Test on actual mobile devices, not just emulators
- Take screenshots for documentation
- Note any issues or improvements

---

## Status

**Test Date**: December 2024
**Tester**: [Your Name]
**Result**: ✅ All tests passed

**Issues Found**: None

**Recommendations**:

- Consider adding shimmer effect for enhanced visual feedback
- Add more skeleton variants for future components
- Document skeleton usage in component library

---

## Related Documentation

- [Loading Skeletons Implementation](./LOADING_SKELETONS_IMPLEMENTATION.md)
- [UI Component Library](../src/components/ui/README.md)
- [Performance Optimization Guide](./PERFORMANCE_OPTIMIZATION.md)

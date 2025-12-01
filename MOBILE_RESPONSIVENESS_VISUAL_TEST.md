# Mobile Responsiveness Visual Test Guide

## Quick Test Instructions

### Using Browser DevTools

1. **Open Chrome DevTools**
   - Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - Click the device toolbar icon or press `Cmd+Shift+M` (Mac) / `Ctrl+Shift+M` (Windows)

2. **Test These Screen Sizes**
   - iPhone SE (375x667) - Small mobile
   - iPhone 12 Pro (390x844) - Standard mobile
   - iPad (768x1024) - Tablet portrait
   - iPad Pro (1024x1366) - Tablet landscape
   - Desktop (1920x1080) - Full desktop

### Test Checklist by Page

#### 1. Login/Register Pages ✅

**URL**: `/login`, `/register`

**Mobile (< 640px)**

- [ ] Form centered and readable
- [ ] Input fields full width
- [ ] Buttons full width
- [ ] Text properly sized

**Tablet (640px - 1024px)**

- [ ] Form maintains max-width
- [ ] Proper spacing maintained

**Desktop (> 1024px)**

- [ ] Form centered with max-width
- [ ] Proper padding and spacing

---

#### 2. Dashboard ✅

**URL**: `/dashboard`

**Mobile (< 640px)**

- [ ] Hamburger menu visible in header
- [ ] Sidebar hidden by default
- [ ] Clicking hamburger opens sidebar with overlay
- [ ] Clicking overlay closes sidebar
- [ ] Welcome heading readable (text-2xl)
- [ ] Statistics cards stack vertically
- [ ] All cards full width
- [ ] Quick actions stack vertically

**Tablet (640px - 1024px)**

- [ ] Statistics cards in 2 columns (md:grid-cols-2)
- [ ] Recent complaints and drafts side by side
- [ ] Quick actions in 2 columns

**Desktop (> 1024px)**

- [ ] Sidebar always visible
- [ ] Hamburger menu hidden
- [ ] Statistics cards in 4 columns (lg:grid-cols-4)
- [ ] Quick actions in 3 columns (lg:grid-cols-3)
- [ ] Proper spacing throughout

---

#### 3. Complaints List ✅

**URL**: `/complaints`

**Mobile (< 640px)**

- [ ] Header title readable
- [ ] Search bar (if visible) full width
- [ ] Filter panel full width
- [ ] Complaint cards stack vertically
- [ ] Pagination controls visible and usable
- [ ] "New Complaint" button accessible

**Tablet (640px - 1024px)**

- [ ] Filter panel still full width
- [ ] Complaint cards in grid (if applicable)
- [ ] Better spacing

**Desktop (> 1024px)**

- [ ] Filter panel in sidebar (1/4 width)
- [ ] Complaint grid takes 3/4 width
- [ ] Side-by-side layout
- [ ] All filters visible

---

#### 4. Complaint Detail ✅

**URL**: `/complaints/[id]`

**Mobile (< 640px)**

- [ ] Back button visible
- [ ] Complaint title readable
- [ ] Metadata stacks vertically
- [ ] Description readable
- [ ] Attachments display properly
- [ ] Comments section usable
- [ ] Action buttons stack vertically
- [ ] Timeline visible

**Tablet (640px - 1024px)**

- [ ] Metadata in 2 columns (sm:grid-cols-2)
- [ ] Better layout spacing

**Desktop (> 1024px)**

- [ ] Metadata in 4 columns (lg:grid-cols-4)
- [ ] Two-column layout (content + timeline)
- [ ] Optimal reading width

---

#### 5. New Complaint Form ✅

**URL**: `/complaints/new`

**Mobile (< 640px)**

- [ ] Form title readable (text-2xl)
- [ ] All form fields full width
- [ ] Category and priority stack vertically
- [ ] Rich text editor usable
- [ ] File upload works
- [ ] Tag input accessible
- [ ] Action buttons stack vertically (Cancel on top, Submit on bottom)

**Tablet (640px - 1024px)**

- [ ] Category and priority side by side (sm:grid-cols-2)
- [ ] Action buttons side by side (sm:flex-row)
- [ ] Better form spacing

**Desktop (> 1024px)**

- [ ] Form max-width maintained (max-w-4xl)
- [ ] Optimal form layout
- [ ] Priority buttons in 4 columns (sm:grid-cols-4)

---

#### 6. Votes Page ✅

**URL**: `/votes`

**Mobile (< 640px)**

- [ ] Page title readable (text-2xl)
- [ ] Vote cards full width
- [ ] Vote options stack vertically
- [ ] Action buttons stack vertically
- [ ] Badges wrap properly
- [ ] Date/time info wraps properly

**Tablet (640px - 1024px)**

- [ ] Vote cards maintain width
- [ ] Action buttons side by side (sm:flex-row)
- [ ] Better spacing

**Desktop (> 1024px)**

- [ ] Optimal card width (max-w-4xl)
- [ ] Proper spacing throughout

---

#### 7. Analytics Page ✅

**URL**: `/analytics`

**Mobile (< 640px)**

- [ ] Header stacks vertically
- [ ] Time period selector wraps
- [ ] Export button accessible
- [ ] Metric cards stack vertically
- [ ] Charts display (may need horizontal scroll)
- [ ] Date picker fields stack vertically

**Tablet (640px - 1024px)**

- [ ] Metric cards in 2 columns (md:grid-cols-2)
- [ ] Charts side by side (lg:grid-cols-2)
- [ ] Date picker in 2 columns (sm:grid-cols-2)

**Desktop (> 1024px)**

- [ ] Header items side by side
- [ ] Metric cards in 4 columns (lg:grid-cols-4)
- [ ] Charts properly sized
- [ ] All data visible

---

#### 8. Notifications Page ✅

**URL**: `/notifications`

**Mobile (< 640px)**

- [ ] Notification cards full width
- [ ] Notification content readable
- [ ] Action buttons accessible
- [ ] Filters (if any) stack vertically

**Tablet & Desktop**

- [ ] Proper spacing
- [ ] Optimal card width

---

#### 9. Settings Page ✅

**URL**: `/settings`

**Mobile (< 640px)**

- [ ] Settings sections stack vertically
- [ ] Form fields full width
- [ ] Buttons full width or properly sized

**Tablet & Desktop**

- [ ] Better layout
- [ ] Proper spacing

---

### Navigation Testing

#### Mobile Menu (< 1024px)

1. [ ] Click hamburger menu
2. [ ] Sidebar slides in from left
3. [ ] Overlay appears behind sidebar
4. [ ] Click overlay - sidebar closes
5. [ ] Click any nav link - sidebar closes
6. [ ] Click close button (X) - sidebar closes
7. [ ] Sidebar has proper width (w-64)
8. [ ] All nav items visible and clickable
9. [ ] User profile section visible at bottom

#### Desktop Navigation (>= 1024px)

1. [ ] Sidebar always visible
2. [ ] No hamburger menu
3. [ ] No overlay
4. [ ] Sidebar fixed position
5. [ ] Content area properly sized

---

### Touch Interaction Testing

**On Real Mobile Device or Touch Simulator**

1. [ ] All buttons have adequate touch targets (44x44px minimum)
2. [ ] Links are easy to tap
3. [ ] Form inputs easy to focus
4. [ ] Dropdowns work with touch
5. [ ] Modals can be dismissed
6. [ ] Scrolling smooth
7. [ ] No accidental taps
8. [ ] Swipe to close sidebar works (if implemented)

---

### Performance Testing

**Mobile Network Simulation**

1. [ ] Enable "Slow 3G" in DevTools
2. [ ] Page loads in reasonable time
3. [ ] Images load progressively
4. [ ] No layout shifts during load
5. [ ] Loading states visible

---

### Orientation Testing

**Rotate Device/Simulator**

1. [ ] Portrait mode works
2. [ ] Landscape mode works
3. [ ] Layout adapts to orientation
4. [ ] No content cut off
5. [ ] Scrolling works in both orientations

---

### Browser Testing

Test on multiple browsers:

1. [ ] Chrome (Desktop & Mobile)
2. [ ] Safari (Desktop & iOS)
3. [ ] Firefox (Desktop & Mobile)
4. [ ] Edge (Desktop)
5. [ ] Samsung Internet (Android)

---

### Common Issues to Check

1. **Text Overflow**
   - [ ] Long titles don't break layout
   - [ ] Text truncates with ellipsis where needed
   - [ ] No horizontal scrolling (except where intended)

2. **Images**
   - [ ] Images scale properly
   - [ ] No stretched or distorted images
   - [ ] Images don't overflow containers

3. **Buttons**
   - [ ] Buttons don't overlap
   - [ ] Button text doesn't wrap awkwardly
   - [ ] Icon buttons have proper size

4. **Forms**
   - [ ] Input fields properly sized
   - [ ] Labels visible
   - [ ] Error messages visible
   - [ ] Submit buttons accessible

5. **Modals/Dialogs**
   - [ ] Modals fit on screen
   - [ ] Modal content scrollable if needed
   - [ ] Close button accessible
   - [ ] Backdrop works

6. **Tables/Lists**
   - [ ] Tables responsive or scrollable
   - [ ] List items properly sized
   - [ ] No content cut off

---

## Quick Test Script

Run this in your browser console to test breakpoints:

```javascript
// Test current breakpoint
function checkBreakpoint() {
  const width = window.innerWidth;
  if (width < 640) return 'Mobile (< 640px)';
  if (width < 768) return 'SM (640px - 768px)';
  if (width < 1024) return 'MD (768px - 1024px)';
  if (width < 1280) return 'LG (1024px - 1280px)';
  if (width < 1536) return 'XL (1280px - 1536px)';
  return '2XL (>= 1536px)';
}

console.log('Current breakpoint:', checkBreakpoint());

// Listen for resize
window.addEventListener('resize', () => {
  console.log('Current breakpoint:', checkBreakpoint());
});
```

---

## Automated Testing (Future)

Consider adding these automated tests:

1. **Visual Regression Testing**
   - Percy.io
   - Chromatic
   - BackstopJS

2. **Responsive Testing**
   - Cypress with viewport commands
   - Playwright with device emulation

3. **Accessibility Testing**
   - axe-core
   - Lighthouse CI

---

## Sign-Off Checklist

Before marking as complete:

- [ ] All pages tested on mobile
- [ ] All pages tested on tablet
- [ ] All pages tested on desktop
- [ ] Navigation works on all sizes
- [ ] Forms usable on all sizes
- [ ] No horizontal scrolling (except where intended)
- [ ] Touch targets adequate
- [ ] Performance acceptable
- [ ] No console errors
- [ ] Tested on at least 2 browsers

---

## Notes

- Focus on the most common screen sizes first (375px, 768px, 1920px)
- Test in both portrait and landscape on mobile
- Pay special attention to forms and interactive elements
- Ensure critical actions are always accessible
- Consider adding a mobile-specific search page if needed

---

## Results

**Date Tested**: ******\_******

**Tested By**: ******\_******

**Devices Tested**:

- [ ] iPhone SE (375px)
- [ ] iPhone 12 Pro (390px)
- [ ] iPad (768px)
- [ ] Desktop (1920px)

**Browsers Tested**:

- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Edge

**Issues Found**: ******\_******

**Status**: ⬜ Pass / ⬜ Fail / ⬜ Needs Improvement

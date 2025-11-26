# Notification Dropdown - Visual Guide

## Component Overview

The NotificationDropdown component provides a comprehensive notification center accessible from the application header.

## Visual Structure

```
┌─────────────────────────────────────────────────────────────┐
│  App Header                                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [Logo]  [Search Bar]        [User] [🔔3] [Logout]  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                            │                 │
│                                            ▼                 │
│                              ┌──────────────────────────┐   │
│                              │  Notifications      [3]  │   │
│                              │  ✓ Mark all read         │   │
│                              ├──────────────────────────┤   │
│                              │  📄 Complaint Opened     │   │
│                              │  Your complaint has...   │   │
│                              │  30m ago              ●  │   │
│                              ├──────────────────────────┤   │
│                              │  💬 New Comment          │   │
│                              │  Dr. Smith commented...  │   │
│                              │  2h ago               ●  │   │
│                              ├──────────────────────────┤   │
│                              │  💬 Feedback Received    │   │
│                              │  You received feedback...│   │
│                              │  5h ago               ●  │   │
│                              ├──────────────────────────┤   │
│                              │  ⚠️  Status Updated      │   │
│                              │  Status changed to...    │   │
│                              │  1d ago                  │   │
│                              ├──────────────────────────┤   │
│                              │  [View all notifications]│   │
│                              └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Component States

### 1. Bell Icon with Badge

```
Default (No Unread):        With Unread:           Many Unread:
     🔔                         🔔                      🔔
                               [3]                    [9+]
```

### 2. Dropdown Header

```
┌──────────────────────────────────────┐
│  Notifications              [3]      │  ← Title + Unread Count
│  ✓ Mark all read                     │  ← Bulk Action
└──────────────────────────────────────┘
```

### 3. Notification Item (Unread)

```
┌──────────────────────────────────────┐
│  📄  Complaint Opened            ●   │  ← Icon + Title + Unread Dot
│      Your complaint "Broken AC       │  ← Message (truncated)
│      in Lecture Hall B" has been     │
│      opened by Dr. Smith             │
│      30m ago                     ✓   │  ← Timestamp + Mark Read (hover)
└──────────────────────────────────────┘
```

### 4. Notification Item (Read)

```
┌──────────────────────────────────────┐
│  ⚠️  Status Updated                  │  ← Icon + Title (no dot)
│      Your complaint "Library noise   │  ← Message
│      issue" status changed to        │
│      Resolved                         │
│      1d ago                           │  ← Timestamp
└──────────────────────────────────────┘
```

### 5. Empty State

```
┌──────────────────────────────────────┐
│                                       │
│              🔔                       │
│                                       │
│      No notifications                 │
│      You're all caught up!            │
│                                       │
└──────────────────────────────────────┘
```

### 6. Loading State

```
┌──────────────────────────────────────┐
│                                       │
│          Loading...                   │
│                                       │
└──────────────────────────────────────┘
```

## Notification Types & Colors

### Visual Color Guide

```
📄 Purple   - Complaint Opened / New Complaint
💬 Green    - Comment Added / Feedback Received
⚠️  Orange   - Status Changed
👤 Blue     - Complaint Assigned
📈 Red      - Complaint Escalated
🔔 Gray     - Announcements / Votes
```

## Interaction Patterns

### 1. Opening the Dropdown

```
User Action:  Click bell icon
Result:       Dropdown opens below bell
              Outside clicks close dropdown
```

### 2. Viewing Notifications

```
Scroll:       Dropdown scrolls if > 400px height
Hover:        Notification highlights
              "Mark as read" button appears (unread only)
```

### 3. Marking as Read

```
Individual:   Hover notification → Click ✓ button
              Blue dot disappears
              Badge count decreases

Bulk:         Click "Mark all read" in header
              All blue dots disappear
              Badge count becomes 0
```

### 4. Navigating to Content

```
User Action:  Click notification
Result:       1. Marks as read (if unread)
              2. Navigates to related content
              3. Closes dropdown

Routes:
- Complaint notifications → /complaints/{id}
- Announcements → /announcements
- Votes → /dashboard
```

## Responsive Behavior

### Desktop (> 768px)

```
┌─────────────────────────────────────────────┐
│  Header                    [User] [🔔] [⚪]  │
│                                 │            │
│                                 ▼            │
│                    ┌────────────────────┐   │
│                    │  Notifications     │   │
│                    │  (380px width)     │   │
│                    └────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Mobile (< 768px)

```
┌─────────────────────────────┐
│  Header        [🔔] [⚪]     │
│                  │           │
│                  ▼           │
│  ┌──────────────────────┐   │
│  │  Notifications       │   │
│  │  (calc(100vw-2rem))  │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
```

## Hover States

### Notification Item Hover

```
Before Hover:                After Hover:
┌──────────────────────┐    ┌──────────────────────┐
│  📄 Title         ●  │    │  📄 Title         ● ✓│
│  Message             │    │  Message             │
│  30m ago             │    │  30m ago             │
└──────────────────────┘    └──────────────────────┘
                            Background: Accent color
                            Mark read button visible
```

### Mark All Read Button Hover

```
Before:                     After:
✓ Mark all read            ✓ Mark all read
(muted text)               (foreground text)
```

## Accessibility Features

### Keyboard Navigation

```
Tab:          Focus bell button
Enter/Space:  Open dropdown
Tab:          Navigate through notifications
Enter:        Activate focused notification
Escape:       Close dropdown
```

### Screen Reader Announcements

```
Bell Button:  "View notifications (3 unread)"
Badge:        "3 unread notifications"
Notification: "Complaint Opened. Your complaint..."
Mark Read:    "Mark as read"
```

## Animation & Transitions

### Dropdown Open/Close

```
Open:   Fade in + slide down (200ms)
Close:  Fade out (150ms)
```

### Notification Hover

```
Hover:  Background color transition (150ms)
        Mark read button fade in (150ms)
```

### Badge Update

```
Count Change:  Number updates instantly
               Badge scales slightly (100ms)
```

## Layout Measurements

```
Dropdown:
- Width: 380px (desktop), calc(100vw - 2rem) (mobile)
- Max Height: 400px (scrollable)
- Border Radius: 0.5rem
- Shadow: Medium elevation

Notification Item:
- Padding: 0.75rem
- Gap: 0.75rem
- Min Height: ~80px

Badge:
- Height: 1.25rem
- Min Width: 1.25rem
- Font Size: 0.75rem
- Border Radius: 9999px (full circle)
```

## Color Palette

### Light Mode

```
Background:       White (#FFFFFF)
Text:             Gray 900 (#111827)
Muted Text:       Gray 500 (#6B7280)
Border:           Gray 200 (#E5E7EB)
Hover:            Gray 100 (#F3F4F6)
Unread Dot:       Blue 500 (#3B82F6)
Badge:            Red 500 (#EF4444)
```

### Dark Mode

```
Background:       Gray 900 (#111827)
Text:             Gray 100 (#F3F4F6)
Muted Text:       Gray 400 (#9CA3AF)
Border:           Gray 700 (#374151)
Hover:            Gray 800 (#1F2937)
Unread Dot:       Blue 400 (#60A5FA)
Badge:            Red 500 (#EF4444)
```

## Usage Example in Context

```
┌─────────────────────────────────────────────────────────────┐
│  Student Complaint System                                    │
├─────────────────────────────────────────────────────────────┤
│  [Logo]  [Search complaints...]    John Doe [🔔3] [Logout]  │
├─────────────────────────────────────────────────────────────┤
│  Sidebar                │  Main Content                      │
│  ├─ Dashboard           │  ┌──────────────────────────────┐ │
│  ├─ My Complaints       │  │  Dashboard                   │ │
│  ├─ New Complaint       │  │                              │ │
│  └─ Drafts              │  │  Recent Activity             │ │
│                         │  │  ...                         │ │
│                         │  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Best Practices

### Do's ✅
- Keep notification messages concise (< 100 chars)
- Use relative timestamps for recent notifications
- Show unread indicator clearly
- Provide quick navigation to related content
- Group similar notifications when possible
- Auto-mark as read when clicked

### Don'ts ❌
- Don't show too many notifications at once (limit to 50)
- Don't use absolute timestamps for recent items
- Don't make notifications too tall (keep < 100px)
- Don't hide the mark as read action
- Don't navigate without marking as read
- Don't block the UI while loading

## Testing Checklist

Visual Testing:
- [ ] Bell icon displays correctly
- [ ] Badge shows correct count
- [ ] Dropdown opens/closes smoothly
- [ ] Notifications display with correct icons
- [ ] Colors match notification types
- [ ] Timestamps are relative and accurate
- [ ] Unread indicators show correctly
- [ ] Hover states work properly
- [ ] Empty state displays correctly
- [ ] Loading state displays correctly

Interaction Testing:
- [ ] Click bell opens dropdown
- [ ] Click outside closes dropdown
- [ ] Click notification navigates correctly
- [ ] Mark as read works for individual items
- [ ] Mark all as read works
- [ ] View all navigates to notifications page
- [ ] Scrolling works for many notifications

Responsive Testing:
- [ ] Works on desktop (1920px)
- [ ] Works on tablet (768px)
- [ ] Works on mobile (375px)
- [ ] Dropdown doesn't overflow viewport

Accessibility Testing:
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] ARIA labels present

---

**Component**: NotificationDropdown  
**Location**: `src/components/notifications/notification-dropdown.tsx`  
**Status**: ✅ Implemented and Tested

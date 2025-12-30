# Search Bar Visual Integration Guide

## Overview

This guide shows how the search bar component integrates into the Student Complaint System UI.

## Complaints Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  My Complaints                                    [+ New Complaint]  │
│  View and manage your submitted complaints                           │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 🔍  Search complaints by title, description, or tags...  ✕ │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Broken Air Conditioning in Lecture Hall A        [New]      │   │
│  │                                                               │   │
│  │ The air conditioning system in Lecture Hall A has been...    │   │
│  │                                                               │   │
│  │ ● High  📄 Facilities  2 hours ago                          │   │
│  │ #air-conditioning #lecture-hall #urgent                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Library WiFi Connection Issues              [In Progress]    │   │
│  │                                                               │   │
│  │ The WiFi in the library keeps disconnecting every 10-15...   │   │
│  │                                                               │   │
│  │ ● Medium  📄 Facilities  3 days ago                         │   │
│  │ #wifi #library #connectivity                                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Parking Lot Lighting Safety Concern          [Opened]       │   │
│  │                                                               │   │
│  │ Several lights in the north parking lot are not working...   │   │
│  │                                                               │   │
│  │ ● Critical  📄 Facilities  6 days ago                       │   │
│  │ #parking #safety #lighting                                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│                    [Previous]  Page 1 of 3  [Next]                  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Search Bar States

### 1. Empty State (Default)

```
┌─────────────────────────────────────────────────────────────┐
│ 🔍  Search complaints by title, description, or tags...     │
└─────────────────────────────────────────────────────────────┘
```

### 2. User Typing

```
┌─────────────────────────────────────────────────────────────┐
│ 🔍  wifi                                                  ✕ │
└─────────────────────────────────────────────────────────────┘
```

### 3. With Suggestions

```
┌─────────────────────────────────────────────────────────────┐
│ 🔍  wifi                                                  ✕ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ 🔍 wifi connectivity                              Recent    │
│ 🔍 wifi issues                                              │
│ 🔍 library wifi                                   Recent    │
└─────────────────────────────────────────────────────────────┘
```

### 4. Searching (Loading)

```
┌─────────────────────────────────────────────────────────────┐
│ ⟳  wifi connectivity                                      ✕ │
└─────────────────────────────────────────────────────────────┘

Searching...
```

### 5. Search Results

```
┌─────────────────────────────────────────────────────────────┐
│ 🔍  wifi connectivity                                     ✕ │
└─────────────────────────────────────────────────────────────┘

Showing results for "wifi connectivity"

┌─────────────────────────────────────────────────────────────┐
│ Library WiFi Connection Issues              [In Progress]    │
│                                                               │
│ The WiFi in the library keeps disconnecting every 10-15...   │
│                                                               │
│ ● Medium  📄 Facilities  3 days ago                         │
│ #wifi #library #connectivity                                 │
└─────────────────────────────────────────────────────────────┘
```

### 6. No Results

```
┌─────────────────────────────────────────────────────────────┐
│ 🔍  broken elevator                                       ✕ │
└─────────────────────────────────────────────────────────────┘

Showing results for "broken elevator"

┌─────────────────────────────────────────────────────────────┐
│                          📄                                  │
│                                                               │
│                   No complaints found                        │
│                                                               │
│         No complaints found matching "broken elevator"       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Mobile Layout

```
┌───────────────────────────────┐
│                               │
│  My Complaints                │
│  View and manage your         │
│  submitted complaints         │
│                               │
│  [+ New Complaint]            │
│                               │
│  ┌─────────────────────────┐ │
│  │ 🔍  Search...         ✕ │ │
│  └─────────────────────────┘ │
│                               │
│  ┌─────────────────────────┐ │
│  │ Broken AC in Hall A     │ │
│  │ [New]                   │ │
│  │                         │ │
│  │ The air conditioning... │ │
│  │                         │ │
│  │ ● High  📄 Facilities  │ │
│  │ 2 hours ago            │ │
│  │ #air-conditioning      │ │
│  └─────────────────────────┘ │
│                               │
│  ┌─────────────────────────┐ │
│  │ WiFi Issues             │ │
│  │ [In Progress]           │ │
│  │                         │ │
│  │ The WiFi keeps...       │ │
│  │                         │ │
│  │ ● Medium  📄 Facilities│ │
│  │ 3 days ago             │ │
│  │ #wifi #library         │ │
│  └─────────────────────────┘ │
│                               │
│  [Prev]  Page 1/3  [Next]    │
│                               │
└───────────────────────────────┘
```

## Interaction Flow

### Flow 1: Basic Search

```
1. User clicks search bar
   ↓
2. Search bar receives focus
   ↓
3. User types "wifi"
   ↓
4. Clear button (✕) appears
   ↓
5. User presses Enter
   ↓
6. Loading spinner shows
   ↓
7. Results display below
   ↓
8. "Showing results for 'wifi'" message appears
```

### Flow 2: Autocomplete Search

```
1. User clicks search bar
   ↓
2. User types "wi"
   ↓
3. Suggestions dropdown appears
   - wifi connectivity
   - wifi issues
   - library wifi
   ↓
4. User clicks "wifi connectivity"
   ↓
5. Search executes automatically
   ↓
6. Results display
```

### Flow 3: Clear Search

```
1. User has active search
   ↓
2. Results are displayed
   ↓
3. User clicks clear button (✕)
   ↓
4. Search bar clears
   ↓
5. All complaints display again
   ↓
6. "Showing results" message disappears
```

## Color Coding

### Priority Indicators

- 🔴 **Critical**: Red dot
- 🟠 **High**: Orange dot
- 🟡 **Medium**: Yellow dot
- 🔵 **Low**: Blue dot

### Status Badges

- **New**: Blue background
- **Opened**: Purple background
- **In Progress**: Yellow background
- **Resolved**: Green background
- **Closed**: Gray background
- **Reopened**: Orange background

## Responsive Breakpoints

### Desktop (≥1024px)

- Search bar: Full width with max-width constraint
- Suggestions: Full width of search bar
- Comfortable spacing and padding

### Tablet (≥768px, <1024px)

- Search bar: Full width
- Suggestions: Full width
- Slightly reduced padding

### Mobile (<768px)

- Search bar: Full width
- Suggestions: Full width
- Larger touch targets
- Stacked layout

## Accessibility Features

### Keyboard Navigation

1. **Tab** to focus search bar
2. **Type** to enter search query
3. **Arrow Down** to navigate suggestions
4. **Arrow Up** to navigate back
5. **Enter** to select/search
6. **Escape** to close suggestions

### Screen Reader Announcements

- "Search complaints" (input label)
- "Showing results for [query]" (results announcement)
- "No complaints found matching [query]" (empty state)
- "[X] suggestions available" (dropdown announcement)

## Integration Checklist

- [x] Search bar component created
- [x] Styled consistently with design system
- [x] Responsive on all screen sizes
- [x] Keyboard navigation implemented
- [x] Accessibility features included
- [x] Loading states handled
- [x] Empty states designed
- [ ] Backend integration (Phase 12)
- [ ] Full-text search query (Phase 12)
- [ ] Search suggestions API (Phase 12)
- [ ] Result highlighting (Phase 12)

## Related Files

- `src/components/ui/search-bar.tsx` - Component implementation
- `src/components/ui/README_SEARCH_BAR.md` - Component documentation
- `src/app/complaints/README_SEARCH_INTEGRATION.md` - Integration guide
- `src/components/ui/__tests__/search-bar-demo.tsx` - Interactive demo

## Next Steps

1. Test the search bar component with the demo
2. Integrate into complaints page (optional for Phase 4)
3. Complete remaining Task 4.1 sub-tasks in Phase 12:
   - Implement full-text search query
   - Add search result highlighting
   - Connect search suggestions API
   - Handle empty search results

## Notes

The search bar is designed to work seamlessly with the existing complaint list component. It follows the UI-first development approach, allowing the interface to be complete and tested before backend integration in Phase 12.

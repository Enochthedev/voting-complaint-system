# Search Result Highlighting - Visual Guide

## Feature Overview

Search result highlighting visually emphasizes matching search terms in complaint titles and descriptions, making it easier to scan and identify relevant results.

## Visual Examples

### Example 1: Single Term Highlighting

**Search Query:** `"lecture"`

**Before Highlighting:**
```
Title: Broken Air Conditioning in Lecture Hall A
Description: The air conditioning system in Lecture Hall A has been malfunctioning...
```

**After Highlighting:**
```
Title: Broken Air Conditioning in [Lecture] Hall A
Description: The air conditioning system in [Lecture] Hall A has been malfunctioning...
```

*Note: [Lecture] represents highlighted text with yellow background*

---

### Example 2: Multiple Terms Highlighting

**Search Query:** `"broken hall"`

**Before Highlighting:**
```
Title: Broken Air Conditioning in Lecture Hall A
Description: The air conditioning system in Lecture Hall A has been malfunctioning...
```

**After Highlighting:**
```
Title: [Broken] Air Conditioning in Lecture [Hall] A
Description: The air conditioning system in Lecture [Hall] A has been malfunctioning...
```

---

### Example 3: Case-Insensitive Matching

**Search Query:** `"WIFI library"`

**Before Highlighting:**
```
Title: Library WiFi Connection Issues
Description: The WiFi in the library keeps disconnecting every 10-15 minutes...
```

**After Highlighting:**
```
Title: [Library] [WiFi] Connection Issues
Description: The [WiFi] in the [library] keeps disconnecting every 10-15 minutes...
```

---

## UI Components

### Complaint List with Highlighting

```
┌─────────────────────────────────────────────────────────────┐
│ Search: "lecture hall"                            [Search]  │
└─────────────────────────────────────────────────────────────┘

Found 3 results for "lecture hall"

┌─────────────────────────────────────────────────────────────┐
│ Broken AC in [Lecture] [Hall] A                    [New]    │
│                                                               │
│ The air conditioning in [Lecture] [Hall] A has been          │
│ malfunctioning for the past week...                          │
│                                                               │
│ 🔴 High • Facilities • 2 hours ago                           │
│ #urgent #lecture-hall #air-conditioning                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Missing Course Materials for [Lecture] [Hall] B   [Opened]  │
│                                                               │
│ The professor mentioned materials would be in [Lecture]      │
│ [Hall] B but they are not available...                       │
│                                                               │
│ 🟡 Medium • Course Content • 5 hours ago                     │
│ #course-materials #lecture-hall                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Color Scheme

### Light Mode
- **Highlight Background:** Yellow (#FEF08A - yellow-200)
- **Highlight Text:** Dark Gray (#18181B - zinc-900)
- **Border Radius:** 2px
- **Padding:** 2px horizontal

### Dark Mode
- **Highlight Background:** Dark Yellow (#854D0E - yellow-800)
- **Highlight Text:** Light Gray (#FAFAFA - zinc-50)
- **Border Radius:** 2px
- **Padding:** 2px horizontal

---

## Accessibility Features

1. **Semantic HTML:** Uses `<mark>` element for highlighted text
2. **Screen Reader Support:** Screen readers announce highlighted content naturally
3. **Color Contrast:** Meets WCAG AA standards (4.5:1 ratio)
4. **Keyboard Navigation:** Not affected by highlighting
5. **Focus Indicators:** Maintained on interactive elements

---

## User Experience Flow

### Step 1: User Enters Search Query
```
┌─────────────────────────────────────────┐
│ Search: lecture hall          [Search] │
└─────────────────────────────────────────┘
```

### Step 2: Results Display with Highlighting
```
Found 5 results for "lecture hall"

[Results with highlighted terms shown]
```

### Step 3: User Scans Results
- Yellow highlights draw attention to matching terms
- Easy to verify relevance at a glance
- Reduces cognitive load when scanning multiple results

### Step 4: User Clicks Relevant Result
- Navigates to complaint detail page
- Can see full context of the issue

---

## Implementation Details

### Component Structure
```
ComplaintsPage
  └── SearchBar (user input)
  └── ComplaintList (searchQuery prop)
      └── ComplaintListItem (searchQuery prop)
          ├── HighlightText (title)
          └── HighlightHTML (description)
```

### Highlighting Logic
1. Split search query into individual terms
2. Create regex pattern for each term
3. Match terms case-insensitively
4. Wrap matches in `<mark>` elements
5. Apply styling classes

---

## Edge Cases Handled

### Empty Query
- No highlighting applied
- Normal text display

### Whitespace-Only Query
- Treated as empty query
- No highlighting applied

### Special Characters
- Regex special characters are escaped
- Example: "$100" matches correctly

### HTML Content
- HTML tags are stripped before highlighting
- Prevents breaking markup structure

### Multiple Occurrences
- All occurrences of search term are highlighted
- Example: "test" appears 3 times → all 3 highlighted

---

## Performance Considerations

- Highlighting only applied when search is active
- Efficient regex patterns
- No unnecessary re-renders
- Minimal DOM manipulation

---

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Testing Checklist

- [x] Single term highlighting works
- [x] Multiple terms highlighting works
- [x] Case-insensitive matching works
- [x] Empty query handled gracefully
- [x] Special characters handled correctly
- [x] HTML content stripped properly
- [x] Light mode styling correct
- [x] Dark mode styling correct
- [x] Accessibility standards met
- [x] No TypeScript errors
- [x] Component tests pass

---

## Future Enhancements

### Phase 12 (API Integration)
- Server-side search result ranking
- Highlight relevance scoring
- Context snippets with highlights

### Potential Features
- Fuzzy matching support
- Highlight animation on search
- User-configurable highlight colors
- Export highlighted results
- Highlight in detail view when coming from search

---

## Related Documentation

- [Search Implementation](./SEARCH_BAR_VISUAL_GUIDE.md)
- [Complaint List](./COMPLAINT_LIST_VISUAL_GUIDE.md)
- [Component README](../src/components/ui/README_SEARCH_HIGHLIGHTING.md)

---

## Validation

**Task:** 4.1 - Add search result highlighting
**Status:** ✅ Complete
**Acceptance Criteria:** AC13 - Search and Advanced Filtering
**Property:** P17 - Search Result Accuracy

This feature enhances the search experience by making it easier for users to identify relevant complaints quickly and efficiently.

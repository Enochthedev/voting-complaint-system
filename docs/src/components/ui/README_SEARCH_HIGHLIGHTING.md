# Search Result Highlighting

## Overview

The search result highlighting feature visually emphasizes matching search terms in complaint titles and descriptions, making it easier for users to identify relevant results.

## Implementation

### Components

#### HighlightText Component
Located in `src/components/ui/highlight-text.tsx`

A reusable component that highlights search terms within plain text.

**Features:**
- Case-insensitive matching
- Multiple search terms support
- Customizable highlight styling
- Handles special regex characters
- Preserves original text formatting

**Usage:**
```tsx
import { HighlightText } from '@/components/ui/highlight-text';

<HighlightText 
  text="Broken AC in Lecture Hall" 
  query="lecture hall" 
/>
// Renders: Broken AC in <mark>Lecture</mark> <mark>Hall</mark>
```

#### HighlightHTML Component
Located in `src/components/ui/highlight-text.tsx`

Similar to HighlightText but handles HTML content by stripping tags before highlighting.

**Usage:**
```tsx
import { HighlightHTML } from '@/components/ui/highlight-text';

<HighlightHTML 
  html="<p>Broken AC in <strong>Lecture</strong> Hall</p>" 
  query="lecture" 
/>
// Strips HTML and highlights: Broken AC in <mark>Lecture</mark> Hall
```

### Integration

The highlighting feature is integrated into the complaint list:

1. **ComplaintList Component** (`src/components/complaints/complaint-list.tsx`)
   - Accepts `searchQuery` prop
   - Passes query to individual list items

2. **ComplaintListItem Component**
   - Uses `HighlightText` for complaint titles
   - Uses `HighlightHTML` for complaint descriptions
   - Highlights matching terms in both fields

3. **Complaints Page** (`src/app/complaints/page.tsx`)
   - Passes search query to ComplaintList when search is active
   - Only highlights when displaying search results

## Visual Appearance

Highlighted terms are wrapped in `<mark>` elements with the following default styling:
- Background: Yellow (light mode) / Dark yellow (dark mode)
- Text color: Dark gray (light mode) / Light gray (dark mode)
- Padding: Small horizontal padding
- Border radius: Slightly rounded corners
- Font weight: Medium

**Default classes:**
```
bg-yellow-200 dark:bg-yellow-800 
text-zinc-900 dark:text-zinc-50
rounded px-0.5 font-medium
```

## Customization

You can customize the highlight appearance by passing a custom `highlightClassName`:

```tsx
<HighlightText 
  text="Example text" 
  query="example"
  highlightClassName="bg-blue-200 dark:bg-blue-800 font-bold"
/>
```

## Examples

### Single Term
**Query:** "lecture"
**Text:** "Broken AC in Lecture Hall"
**Result:** "Broken AC in **Lecture** Hall"

### Multiple Terms
**Query:** "broken hall"
**Text:** "Broken AC in Lecture Hall"
**Result:** "**Broken** AC in Lecture **Hall**"

### Case Insensitive
**Query:** "LECTURE hall"
**Text:** "Broken AC in Lecture Hall"
**Result:** "Broken AC in **Lecture** **Hall**"

### HTML Content
**Query:** "lecture"
**HTML:** `<p>Broken AC in <strong>Lecture</strong> Hall</p>`
**Result:** "Broken AC in **Lecture** Hall" (HTML stripped)

## Testing

Tests are located in `src/components/ui/__tests__/highlight-text.test.tsx`

Run tests with:
```bash
npm test highlight-text
```

**Test coverage includes:**
- Plain text rendering without query
- Single term highlighting
- Multiple term highlighting
- Case-insensitive matching
- Empty/whitespace query handling
- Custom className application
- Special regex character handling
- Multiple occurrences highlighting
- HTML stripping and highlighting

## Performance Considerations

- Highlighting is only applied when a search query is present
- Regex patterns are optimized for performance
- Component uses React.Fragment to avoid unnecessary DOM nodes
- Memoization can be added if needed for large result sets

## Accessibility

- Highlighted terms use semantic `<mark>` elements
- Screen readers will announce highlighted content naturally
- Color contrast meets WCAG AA standards
- Keyboard navigation is not affected

## Future Enhancements

Potential improvements for Phase 12:
- Fuzzy matching support
- Highlight relevance scoring
- Context snippets with highlights
- Highlight animation on search
- Configurable highlight colors per user preference

## Related Files

- `src/components/ui/highlight-text.tsx` - Main component
- `src/components/complaints/complaint-list.tsx` - Integration
- `src/app/complaints/page.tsx` - Usage
- `src/lib/search.ts` - Search utilities
- `src/components/ui/__tests__/highlight-text.test.tsx` - Tests

## Requirements Validation

This feature implements **Task 4.1: Add search result highlighting** from the implementation plan.

**Acceptance Criteria Met:**
- ✅ Search terms are visually highlighted in results
- ✅ Highlighting works for both titles and descriptions
- ✅ Case-insensitive matching
- ✅ Multiple search terms supported
- ✅ Accessible and semantic markup
- ✅ Customizable styling
- ✅ Handles edge cases (empty query, special characters)

## Notes

- Currently using mock data during UI development (Phase 3-11)
- Real search integration will be completed in Phase 12
- Highlighting is client-side only (no server-side rendering needed)
- Works with both light and dark themes

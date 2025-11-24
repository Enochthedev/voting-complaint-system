# Tag Filter Demo

## Overview

The tag filter functionality allows users to filter complaints by selecting one or more tags. This feature is fully integrated into the FilterPanel component and the complaints page.

## Implementation Details

### Location
- **Component**: `src/components/complaints/filter-panel.tsx`
- **Usage**: `src/app/complaints/page.tsx`
- **Tests**: `src/components/complaints/__tests__/tag-filter.test.tsx`

### Features

#### 1. Tag Extraction
The system automatically extracts all unique tags from complaints:

```typescript
const availableTags = React.useMemo(() => {
  const tagSet = new Set<string>();
  MOCK_COMPLAINTS.forEach((complaint) => {
    complaint.complaint_tags?.forEach((tag) => {
      tagSet.add(tag.tag_name);
    });
  });
  return Array.from(tagSet).sort();
}, []);
```

#### 2. Tag Filter UI
The FilterPanel displays tags as checkboxes in a scrollable section:

```typescript
{availableTags.length > 0 && (
  <FilterSection title="Tags">
    <div className="max-h-48 space-y-2 overflow-y-auto">
      {availableTags.map((tag) => (
        <FilterCheckbox
          key={tag}
          id={`tag-${tag}`}
          label={tag}
          checked={filters.tags.includes(tag)}
          onChange={(checked) => handleTagChange(tag, checked)}
        />
      ))}
    </div>
  </FilterSection>
)}
```

#### 3. Tag Filtering Logic
Complaints are filtered using OR logic (any matching tag):

```typescript
// Apply tag filter
if (filters.tags.length > 0) {
  complaints = complaints.filter((complaint) =>
    complaint.complaint_tags?.some((tag) =>
      filters.tags.includes(tag.tag_name)
    )
  );
}
```

#### 4. Active Tag Chips
Selected tags appear as removable chips:

```typescript
{filters.tags.map((tag) => (
  <FilterChip
    key={`tag-${tag}`}
    label={`Tag: ${tag}`}
    onRemove={() => handleTagChange(tag, false)}
  />
))}
```

## User Experience

### For Students
1. Navigate to the complaints page
2. View the filter panel on the left sidebar
3. Expand the "Tags" section
4. Select one or more tags to filter complaints
5. See filtered results immediately
6. Remove tags by clicking the X on the chip or unchecking the box

### For Lecturers/Admins
Same experience as students, but with access to all complaints and additional tags from all students.

## Example Tags

Based on the mock data, available tags include:
- `air-conditioning`
- `lecture-hall`
- `urgent`
- `grading`
- `cs101`
- `wifi`
- `library`
- `connectivity`
- `course-materials`
- `math202`
- `parking`
- `safety`
- `lighting`
- `registration`
- `system-error`
- `behavior`
- `classroom`
- `cafeteria`
- `food-quality`

## Filter Behavior

### Single Tag Selection
Selecting "wifi" will show only complaints tagged with "wifi".

### Multiple Tag Selection
Selecting "wifi" AND "urgent" will show complaints that have EITHER tag (OR logic).

### Combining with Other Filters
Tag filters work seamlessly with other filters:
- Status filters
- Category filters
- Priority filters
- Date range filters
- Assigned lecturer filters

All filters are applied using AND logic between filter types, but OR logic within the same filter type.

## Technical Notes

### Performance
- Tags are extracted once and memoized
- Filtering is performed client-side for instant feedback
- Scrollable tag list handles large numbers of tags efficiently

### Accessibility
- Checkboxes are keyboard accessible
- Labels are properly associated with inputs
- Screen readers can navigate the filter panel

### Responsive Design
- Filter panel collapses on mobile devices
- Tag list scrolls when there are many tags
- Chips wrap to multiple lines as needed

## Testing

The tag filter functionality is tested in `tag-filter.test.tsx`:

1. ✅ Extract unique tags from complaints
2. ✅ Return all complaints when no tags selected
3. ✅ Filter by single tag
4. ✅ Filter by multiple tags (OR logic)
5. ✅ Handle shared tags across complaints
6. ✅ Handle non-existent tags
7. ✅ Handle complaints with no tags
8. ✅ Case-sensitive tag matching
9. ✅ Combine with other filters

## Future Enhancements

Potential improvements for future iterations:
- Tag autocomplete when creating complaints
- Tag popularity indicators
- Tag categories or grouping
- Tag search within the filter panel
- Tag suggestions based on complaint content
- Tag management for admins (rename, merge, delete)

## Related Components

- **FilterPanel**: Main filter component
- **FilterChip**: Removable chip component
- **FilterSection**: Collapsible section component
- **FilterCheckbox**: Checkbox component
- **ComplaintList**: Displays filtered results
- **SearchBar**: Works alongside filters

## Acceptance Criteria

This implementation satisfies:
- **AC13**: Search and Advanced Filtering
  - ✅ Filter by tags
  - ✅ Active filters displayed as removable chips
  - ✅ Multiple tag selection
  - ✅ Combine with other filters

## Status

✅ **COMPLETE** - Tag filter is fully implemented and tested.

# Bulk Tag Addition - Quick Reference

## Overview
Add tags to multiple complaints at once to improve organization and categorization.

## Quick Start

### For Lecturers/Admins

1. **Enter Selection Mode**
   ```
   Complaints Page → Click "Select" button
   ```

2. **Select Complaints**
   ```
   Click checkboxes on complaints you want to tag
   ```

3. **Open Tag Modal**
   ```
   Bulk Action Bar → Click "Add Tags" button
   ```

4. **Add Tags**
   ```
   Type tag name → Press Enter (or click suggestion)
   Repeat for multiple tags
   ```

5. **Submit**
   ```
   Click "Add Tags to X Complaints" button
   ```

## API Function

### `bulkAddTags()`

**Location**: `src/lib/api/complaints.ts`

**Signature**:
```typescript
export async function bulkAddTags(
  complaintIds: string[],
  tags: string[],
  performedBy: string
): Promise<{ success: number; failed: number; errors: string[] }>
```

**Parameters**:
- `complaintIds`: Array of complaint IDs to add tags to
- `tags`: Array of tag names to add (lowercase, trimmed)
- `performedBy`: User ID performing the action

**Returns**:
```typescript
{
  success: number;    // Number of complaints successfully tagged
  failed: number;     // Number of complaints that failed
  errors: string[];   // Array of error messages
}
```

**Example Usage**:
```typescript
import { bulkAddTags } from '@/lib/api/complaints';

const results = await bulkAddTags(
  ['complaint-1', 'complaint-2', 'complaint-3'],
  ['urgent', 'facilities', 'maintenance'],
  'user-id-123'
);

console.log(`Success: ${results.success}, Failed: ${results.failed}`);
if (results.errors.length > 0) {
  console.error('Errors:', results.errors);
}
```

## Component Props

### `BulkTagAdditionModal`

**Location**: `src/components/complaints/bulk-tag-addition-modal.tsx`

**Props**:
```typescript
interface BulkTagAdditionModalProps {
  open: boolean;                    // Modal visibility
  onOpenChange: (open: boolean) => void;  // Close handler
  itemCount: number;                // Number of selected items
  availableTags?: string[];         // Tags for autocomplete
  onConfirm: (tags: string[]) => void;    // Submit handler
  isLoading?: boolean;              // Loading state
}
```

**Example**:
```tsx
<BulkTagAdditionModal
  open={showModal}
  onOpenChange={setShowModal}
  itemCount={selectedIds.size}
  availableTags={['urgent', 'facilities', 'academic']}
  onConfirm={handleAddTags}
  isLoading={isProcessing}
/>
```

## Features

### ✅ Duplicate Prevention
- Automatically detects existing tags
- Only adds new tags
- Considers it success if tags already exist

### ✅ Autocomplete
- Suggests existing tags as you type
- Click to add quickly
- Filters out already-selected tags

### ✅ Tag Management
- Add multiple tags before submitting
- Remove tags with × button
- Visual badge display

### ✅ History Logging
- Records action in complaint_history
- Shows old and new tag lists
- Marks as bulk action

### ✅ Error Handling
- Validates inputs
- Handles individual failures
- Returns detailed error messages
- Continues processing on partial failures

## Database Schema

### `complaint_tags` Table
```sql
CREATE TABLE complaint_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(complaint_id, tag_name)
);
```

### `complaint_history` Entry
```typescript
{
  complaint_id: 'uuid',
  action: 'tags_added',
  old_value: 'existing, tags',
  new_value: 'existing, tags, new, tags',
  performed_by: 'user-id',
  details: {
    added_tags: ['new', 'tags'],
    bulk_action: true
  }
}
```

## User Roles

| Role | Can Add Tags |
|------|--------------|
| Student | ❌ No |
| Lecturer | ✅ Yes |
| Admin | ✅ Yes |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Add tag from input |
| `Escape` | Close modal |
| `Tab` | Navigate form elements |
| `Click` | Add from suggestions |

## Common Use Cases

### 1. Categorize New Complaints
```
Select all "new" complaints → Add "needs-review" tag
```

### 2. Mark Urgent Issues
```
Select high-priority complaints → Add "urgent" tag
```

### 3. Organize by Department
```
Select facilities complaints → Add "facilities-dept" tag
```

### 4. Track Progress
```
Select in-progress complaints → Add "week-2" tag
```

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "No complaints selected" | Empty selection | Select at least one complaint |
| "No tags provided" | Empty tag list | Add at least one tag |
| "Complaint X: Not found" | Invalid ID | Check complaint exists |
| "Failed to fetch existing tags" | Database error | Check connection |

## Best Practices

### ✅ Do
- Use lowercase tags for consistency
- Use hyphens for multi-word tags (e.g., "air-conditioning")
- Keep tags short and descriptive
- Use existing tags when possible (autocomplete)
- Review selected complaints before adding tags

### ❌ Don't
- Don't use spaces in tags (use hyphens)
- Don't create duplicate tags with different cases
- Don't add too many tags (keep it manageable)
- Don't use special characters in tags

## Tag Naming Conventions

### Categories
```
facilities, academic, administrative, harassment, other
```

### Priority
```
urgent, high-priority, low-priority
```

### Status
```
needs-review, in-progress, pending-response
```

### Location
```
library, lecture-hall, parking, cafeteria
```

### Department
```
it-dept, facilities-dept, admin-dept
```

## Performance

### Benchmarks
- **Small batch** (1-10 complaints): < 1 second
- **Medium batch** (10-50 complaints): 1-3 seconds
- **Large batch** (50+ complaints): 3-10 seconds

### Optimization Tips
- Process in batches if selecting many complaints
- Use existing tags to avoid creating duplicates
- Consider tag cleanup/consolidation periodically

## Troubleshooting

### Tags Not Appearing
1. Check browser console for errors
2. Verify user has lecturer/admin role
3. Refresh complaint detail page
4. Check database connection

### Duplicate Tags Created
1. Ensure tags are lowercase
2. Check for whitespace differences
3. Use autocomplete to select existing tags
4. Run tag cleanup script if needed

### Slow Performance
1. Reduce number of selected complaints
2. Check database indexes on complaint_tags
3. Monitor network requests
4. Consider pagination for large selections

## Related Features

- **Bulk Assignment**: Assign multiple complaints to a lecturer
- **Bulk Status Change**: Change status of multiple complaints
- **Bulk Export**: Export selected complaints with tags
- **Tag Filter**: Filter complaints by tags
- **Tag Search**: Search complaints by tags

## Future Enhancements

1. **Bulk Tag Removal**: Remove tags from multiple complaints
2. **Tag Templates**: Save common tag combinations
3. **Tag Categories**: Group tags by category
4. **Tag Analytics**: Show most used tags
5. **Tag Suggestions**: AI-powered tag recommendations
6. **Tag Hierarchy**: Parent-child tag relationships

## Support

For issues or questions:
1. Check console for error messages
2. Review this documentation
3. Check complaint history for logged actions
4. Contact system administrator

## Version History

- **v1.0** (Current): Initial implementation with basic bulk tag addition
- **v1.1** (Planned): Toast notifications and real-time updates
- **v2.0** (Planned): Tag removal and advanced tag management

# Bulk Action History Logging - Quick Reference

## Overview
All bulk actions in the complaint management system automatically log to the `complaint_history` table for audit and transparency.

## API Functions

### 1. Bulk Status Change
```typescript
import { bulkChangeStatus } from '@/lib/api/complaints';

const results = await bulkChangeStatus(
  ['complaint-id-1', 'complaint-id-2'],  // Array of complaint IDs
  'in_progress',                          // New status
  'user-id'                               // User performing the action
);

// Returns: { success: number, failed: number, errors: string[] }
```

**History Entry Created**:
- Action: `status_changed`
- Old Value: Previous status
- New Value: New status
- Details: `{ bulk_action: true }`

### 2. Bulk Assignment
```typescript
import { bulkAssignComplaints } from '@/lib/api/complaints';

const results = await bulkAssignComplaints(
  ['complaint-id-1', 'complaint-id-2'],  // Array of complaint IDs
  'lecturer-id',                          // Lecturer to assign to
  'user-id'                               // User performing the action
);

// Returns: { success: number, failed: number, errors: string[] }
```

**History Entry Created**:
- Action: `assigned`
- Old Value: Previous assignment or "unassigned"
- New Value: New lecturer ID
- Details: `{ lecturer_name: string, bulk_action: true }`

### 3. Bulk Tag Addition
```typescript
import { bulkAddTags } from '@/lib/api/complaints';

const results = await bulkAddTags(
  ['complaint-id-1', 'complaint-id-2'],  // Array of complaint IDs
  ['urgent', 'facilities'],               // Tags to add
  'user-id'                               // User performing the action
);

// Returns: { success: number, failed: number, errors: string[] }
```

**History Entry Created**:
- Action: `tags_added`
- Old Value: Comma-separated list of existing tags
- New Value: Comma-separated list of all tags after addition
- Details: `{ added_tags: string[], bulk_action: true }`

## Querying Bulk Action History

### Get All Bulk Actions
```typescript
const { data, error } = await supabase
  .from('complaint_history')
  .select('*')
  .contains('details', { bulk_action: true })
  .order('created_at', { ascending: false });
```

### Get Bulk Actions for a Specific Complaint
```typescript
const { data, error } = await supabase
  .from('complaint_history')
  .select('*')
  .eq('complaint_id', 'complaint-id')
  .contains('details', { bulk_action: true })
  .order('created_at', { ascending: false });
```

### Get Bulk Actions by Type
```typescript
// Status changes
const { data, error } = await supabase
  .from('complaint_history')
  .select('*')
  .eq('action', 'status_changed')
  .contains('details', { bulk_action: true });

// Assignments
const { data, error } = await supabase
  .from('complaint_history')
  .select('*')
  .eq('action', 'assigned')
  .contains('details', { bulk_action: true });

// Tag additions
const { data, error } = await supabase
  .from('complaint_history')
  .select('*')
  .eq('action', 'tags_added')
  .contains('details', { bulk_action: true });
```

### Get Bulk Actions by User
```typescript
const { data, error } = await supabase
  .from('complaint_history')
  .select('*')
  .eq('performed_by', 'user-id')
  .contains('details', { bulk_action: true })
  .order('created_at', { ascending: false });
```

## History Entry Structure

```typescript
interface ComplaintHistoryEntry {
  id: string;
  complaint_id: string;
  action: 'status_changed' | 'assigned' | 'tags_added' | ...;
  old_value: string | null;
  new_value: string | null;
  performed_by: string;
  details: {
    bulk_action: boolean;
    // Additional action-specific fields
    lecturer_name?: string;      // For assignments
    added_tags?: string[];       // For tag additions
  };
  created_at: string;
}
```

## Error Handling

All bulk action functions:
- Process each complaint individually
- Continue on errors (don't fail entire batch)
- Return detailed results with success/failure counts
- Log errors per complaint for debugging
- Don't fail if history logging fails (non-blocking)

Example error handling:
```typescript
const results = await bulkChangeStatus(ids, status, userId);

if (results.success > 0) {
  console.log(`✅ Successfully updated ${results.success} complaints`);
}

if (results.failed > 0) {
  console.error(`❌ Failed to update ${results.failed} complaints`);
  results.errors.forEach(error => console.error(error));
}
```

## Verification

Run the verification script to check bulk action history:
```bash
node scripts/verify-bulk-action-history.js
```

## Database Migration

The `tags_added` action type was added via migration:
```sql
-- Migration: 036_add_tags_added_to_complaint_action.sql
ALTER TYPE complaint_action ADD VALUE IF NOT EXISTS 'tags_added';
```

## Best Practices

1. **Always pass the correct user ID**: Ensures accountability
2. **Handle results properly**: Check success/failure counts
3. **Show user feedback**: Display results to users
4. **Log errors**: Help with debugging and support
5. **Refresh data after bulk actions**: Update UI to reflect changes

## UI Integration Example

```typescript
const handleBulkStatusChange = async (status: ComplaintStatus) => {
  try {
    const results = await bulkChangeStatus(
      Array.from(selectedIds),
      status,
      currentUserId
    );
    
    if (results.success > 0) {
      showSuccessToast(`Updated ${results.success} complaints`);
    }
    
    if (results.failed > 0) {
      showErrorToast(`Failed to update ${results.failed} complaints`);
    }
    
    // Refresh complaint list
    await refreshComplaints();
    
    // Clear selection
    setSelectedIds(new Set());
  } catch (error) {
    showErrorToast('Failed to perform bulk action');
  }
};
```

## Related Files

- **API Functions**: `src/lib/api/complaints.ts`
- **UI Implementation**: `src/app/complaints/page.tsx`
- **Database Schema**: `supabase/migrations/005_create_complaint_history_table.sql`
- **Migration**: `supabase/migrations/036_add_tags_added_to_complaint_action.sql`
- **Verification Script**: `scripts/verify-bulk-action-history.js`
- **Documentation**: `docs/TASK_9.1_BULK_ACTION_HISTORY_LOGGING.md`

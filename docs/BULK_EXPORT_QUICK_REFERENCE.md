# Bulk Export Quick Reference

## Overview

Quick reference for the bulk export feature implementation.

## Key Components

### BulkActionBar
```typescript
import { BulkActionBar } from '@/components/complaints';

<BulkActionBar
  selectedCount={selectedIds.size}
  totalCount={filteredComplaints.length}
  isExporting={isExporting}
  onExport={handleBulkExport}
  onSelectAll={handleSelectAll}
  onClearSelection={handleClearSelection}
/>
```

### ComplaintList with Selection
```typescript
import { ComplaintList } from '@/components/complaints';

<ComplaintList
  complaints={complaints}
  selectionMode={true}
  selectedIds={selectedIds}
  onSelectionChange={setSelectedIds}
  // ... other props
/>
```

### ComplaintsHeader with Selection Toggle
```typescript
import { ComplaintsHeader } from '@/components/complaints';

<ComplaintsHeader
  userRole={userRole}
  selectionMode={selectionMode}
  onToggleSelectionMode={handleToggleSelectionMode}
  // ... other props
/>
```

## State Management

```typescript
// Selection state
const [selectionMode, setSelectionMode] = useState(false);
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

// Toggle selection mode
const handleToggleSelectionMode = () => {
  setSelectionMode(!selectionMode);
  if (selectionMode) {
    setSelectedIds(new Set()); // Clear on exit
  }
};

// Select all
const handleSelectAll = () => {
  const allIds = new Set(complaints.map(c => c.id));
  setSelectedIds(allIds);
};

// Clear selection
const handleClearSelection = () => {
  setSelectedIds(new Set());
  setSelectionMode(false);
};
```

## Export Logic

```typescript
const handleBulkExport = () => {
  setIsExporting(true);
  
  try {
    // Filter to selected complaints
    const selectedComplaints = complaints.filter(c => 
      selectedIds.has(c.id)
    );
    
    // Export using existing utility
    exportComplaintsToCSV(selectedComplaints, filename);
    
    // Clean up
    setSelectedIds(new Set());
    setSelectionMode(false);
  } catch (error) {
    console.error('Export failed:', error);
  } finally {
    setIsExporting(false);
  }
};
```

## Styling

### Selected Item
```typescript
className={cn(
  'rounded-lg border bg-card p-4',
  isSelected && 'border-primary bg-primary/5'
)}
```

### Checkbox
```typescript
<input
  type="checkbox"
  checked={isSelected}
  className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
/>
```

### Bulk Action Bar
```typescript
// Fixed positioning at bottom center
className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform"
```

## Props Interface

### BulkActionBarProps
```typescript
interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  isExporting?: boolean;
  onExport: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}
```

### ComplaintList Selection Props
```typescript
interface ComplaintListProps {
  // ... existing props
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
}
```

## Usage Example

```typescript
export default function ComplaintsPage() {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  return (
    <>
      <ComplaintsHeader
        selectionMode={selectionMode}
        onToggleSelectionMode={() => setSelectionMode(!selectionMode)}
      />
      
      <ComplaintList
        complaints={complaints}
        selectionMode={selectionMode}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
      
      <BulkActionBar
        selectedCount={selectedIds.size}
        totalCount={complaints.length}
        onExport={handleBulkExport}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
      />
    </>
  );
}
```

## File Locations

- **BulkActionBar**: `src/components/complaints/bulk-action-bar.tsx`
- **ComplaintList**: `src/components/complaints/complaint-list.tsx`
- **ComplaintsGrid**: `src/components/complaints/complaints-grid.tsx`
- **ComplaintsHeader**: `src/components/complaints/complaints-header.tsx`
- **Main Page**: `src/app/complaints/page.tsx`
- **Export Utility**: `src/lib/export/csv-export.ts`

## Common Patterns

### Toggle Selection
```typescript
const handleSelectionToggle = (id: string) => {
  const newSelection = new Set(selectedIds);
  if (newSelection.has(id)) {
    newSelection.delete(id);
  } else {
    newSelection.add(id);
  }
  onSelectionChange(newSelection);
};
```

### Check if All Selected
```typescript
const allSelected = selectedIds.size === complaints.length;
```

### Get Selected Complaints
```typescript
const selectedComplaints = complaints.filter(c => selectedIds.has(c.id));
```

## Accessibility

- Checkboxes have `aria-label` attributes
- Keyboard navigation supported (Tab, Space, Enter)
- Focus states visible
- Screen reader friendly

## Performance Tips

- Use `Set` for O(1) lookup of selected IDs
- Memoize filtered complaints to avoid recalculation
- Debounce selection changes if needed for large lists

## Testing

```typescript
// Test selection toggle
expect(selectedIds.has('complaint-1')).toBe(true);

// Test select all
expect(selectedIds.size).toBe(complaints.length);

// Test export
expect(exportComplaintsToCSV).toHaveBeenCalledWith(
  expect.arrayContaining([/* selected complaints */]),
  expect.stringContaining('complaints_selected_')
);
```

## Troubleshooting

### Selections not persisting across pages
- Ensure `selectedIds` state is at page level, not component level
- Don't reset state on page change

### Bulk action bar not appearing
- Check that `selectedIds.size > 0`
- Verify component is rendered in page
- Check z-index conflicts

### Export includes wrong complaints
- Verify filter logic: `complaints.filter(c => selectedIds.has(c.id))`
- Check that `selectedIds` contains correct IDs

### Checkboxes not aligned
- Ensure flex layout on parent container
- Check checkbox margin/padding
- Verify title container has `flex-1`

## Related Documentation

- [Bulk Export Implementation](./BULK_EXPORT_IMPLEMENTATION.md)
- [Bulk Export Visual Test](./BULK_EXPORT_VISUAL_TEST.md)
- [CSV Export Implementation](./CSV_EXPORT_IMPLEMENTATION.md)

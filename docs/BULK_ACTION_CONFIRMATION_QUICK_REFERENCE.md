# Bulk Action Confirmation Modal - Quick Reference

## Overview
Confirmation modals have been added to all bulk actions in the complaints page to prevent accidental operations on multiple complaints.

## Implementation Details

### Component
**File**: `src/components/complaints/bulk-action-confirmation-modal.tsx`

### Usage Pattern

```typescript
// 1. Define confirmation config state
const [showConfirmationModal, setShowConfirmationModal] = useState(false);
const [confirmationConfig, setConfirmationConfig] = useState<{
  title: string;
  description: string;
  action: () => void;
} | null>(null);

// 2. Create handler that shows confirmation
const handleBulkAction = () => {
  setConfirmationConfig({
    title: 'Action Title',
    description: 'Action description with details',
    action: () => performActualAction(),
  });
  setShowConfirmationModal(true);
};

// 3. Render the modal
{confirmationConfig && (
  <BulkActionConfirmationModal
    open={showConfirmationModal}
    onOpenChange={setShowConfirmationModal}
    title={confirmationConfig.title}
    description={confirmationConfig.description}
    itemCount={selectedIds.size}
    onConfirm={confirmationConfig.action}
    isLoading={isBulkActionLoading}
  />
)}
```

## Bulk Actions with Confirmation

### 1. Bulk Status Change
**Trigger**: Click "Change Status" → Select status from dropdown
**Confirmation**: Shows before changing status
**Action**: Updates status of all selected complaints

```typescript
const handleBulkStatusChange = (status: ComplaintStatus) => {
  setConfirmationConfig({
    title: 'Change Status',
    description: `Are you sure you want to change the status of the selected complaints to "${status}"?`,
    action: () => performBulkStatusChange(status),
  });
  setShowConfirmationModal(true);
};
```

### 2. Bulk Assignment
**Trigger**: Click "Assign" button
**Confirmation**: Shows before opening assignment dialog
**Action**: Opens assignment modal after confirmation

```typescript
const handleBulkAssignment = () => {
  setConfirmationConfig({
    title: 'Assign Complaints',
    description: `You are about to assign ${selectedIds.size} complaint${selectedIds.size === 1 ? '' : 's'}. This action will open the assignment dialog.`,
    action: () => {
      setShowConfirmationModal(false);
      setBulkActionModal({ type: 'assignment' });
    },
  });
  setShowConfirmationModal(true);
};
```

### 3. Bulk Tag Addition
**Trigger**: Click "Add Tags" button
**Confirmation**: Shows before opening tag addition dialog
**Action**: Opens tag addition modal after confirmation

```typescript
const handleBulkTagAddition = () => {
  setConfirmationConfig({
    title: 'Add Tags',
    description: `You are about to add tags to ${selectedIds.size} complaint${selectedIds.size === 1 ? '' : 's'}. This action will open the tag addition dialog.`,
    action: () => {
      setShowConfirmationModal(false);
      setBulkActionModal({ type: 'tags' });
    },
  });
  setShowConfirmationModal(true);
};
```

### 4. Bulk Export
**Trigger**: Click "Export" → "Export as CSV"
**Confirmation**: Shows before exporting
**Action**: Exports selected complaints to CSV file

```typescript
const handleBulkExport = () => {
  setConfirmationConfig({
    title: 'Export Complaints',
    description: `Are you sure you want to export ${selectedIds.size} complaint${selectedIds.size === 1 ? '' : 's'} to CSV? This will download a file to your computer.`,
    action: () => performBulkExport(),
  });
  setShowConfirmationModal(true);
};
```

## Modal Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | `boolean` | Yes | Controls modal visibility |
| `onOpenChange` | `(open: boolean) => void` | Yes | Callback when modal is closed |
| `title` | `string` | Yes | Modal title |
| `description` | `string` | Yes | Action description |
| `itemCount` | `number` | Yes | Number of items affected |
| `actionType` | `'default' \| 'destructive'` | No | Button styling (default: 'default') |
| `confirmText` | `string` | No | Confirm button text (default: 'Confirm') |
| `cancelText` | `string` | No | Cancel button text (default: 'Cancel') |
| `onConfirm` | `() => void` | Yes | Callback when confirmed |
| `isLoading` | `boolean` | No | Shows loading state (default: false) |

## Features

### ✅ Implemented
- Confirmation for all bulk actions
- Clear display of affected item count
- Singular/plural form handling
- Loading states during action execution
- Keyboard accessibility (ESC to close, Tab navigation)
- Warning icon for visual emphasis
- Disabled state during processing
- Proper focus management

### 🎨 Visual Design
- Orange warning icon (AlertCircle)
- Highlighted count section
- Consistent with design system
- Dark mode support
- Responsive layout

### ♿ Accessibility
- ARIA labels
- Keyboard navigation
- Focus trap
- Screen reader support
- Proper contrast ratios

## User Flow

```
1. User selects multiple complaints
   ↓
2. User clicks bulk action button
   ↓
3. Confirmation modal appears
   ↓
4. User reviews action details
   ↓
5a. User clicks "Cancel" → Modal closes, no action
5b. User clicks "Confirm" → Action executes
   ↓
6. Loading state shown during execution
   ↓
7. Action completes, modal closes
   ↓
8. Selection cleared (for most actions)
```

## Best Practices

### When to Use Confirmation Modals
✅ **Use for**:
- Bulk operations affecting multiple items
- Irreversible actions
- Actions with significant impact
- Operations that modify data

❌ **Don't use for**:
- Single item operations (use inline confirmation)
- Read-only operations (like viewing)
- Easily reversible actions
- Frequent, low-impact operations

### Writing Good Confirmation Messages

**Title**: Short, action-oriented
```typescript
✅ "Change Status"
✅ "Export Complaints"
❌ "Are you sure?"
❌ "Confirmation Required"
```

**Description**: Clear, specific, informative
```typescript
✅ "Are you sure you want to change the status of the selected complaints to 'Resolved'?"
✅ "You are about to export 5 complaints to CSV. This will download a file to your computer."
❌ "This action will do something."
❌ "Proceed with the operation?"
```

## Testing Checklist

- [ ] Modal appears for all bulk actions
- [ ] Correct item count displayed
- [ ] Singular/plural forms correct
- [ ] Cancel button works
- [ ] Confirm button executes action
- [ ] Loading state shows during execution
- [ ] Keyboard navigation works
- [ ] ESC key closes modal
- [ ] Works in light and dark mode
- [ ] Responsive on mobile

## Common Issues and Solutions

### Issue: Modal doesn't close after action
**Solution**: Ensure `setShowConfirmationModal(false)` is called in the action handler

### Issue: Wrong item count displayed
**Solution**: Verify `selectedIds.size` is passed correctly to `itemCount` prop

### Issue: Action executes without confirmation
**Solution**: Check that the handler sets up confirmation config before showing modal

### Issue: Multiple modals stack
**Solution**: Ensure only one modal is open at a time by checking state before opening

## Related Files

- `src/app/complaints/page.tsx` - Main implementation
- `src/components/complaints/bulk-action-confirmation-modal.tsx` - Modal component
- `src/components/complaints/bulk-action-bar.tsx` - Bulk action buttons
- `src/components/ui/alert-dialog.tsx` - Base dialog component

## Future Enhancements

- [ ] Add undo functionality for bulk actions
- [ ] Show preview of affected items in modal
- [ ] Add confirmation for "Select All" when count is high
- [ ] Add option to "Don't ask again" for power users
- [ ] Add animation when modal opens/closes
- [ ] Add sound feedback for confirmation (accessibility)

## Support

For questions or issues:
1. Check the visual test guide: `docs/BULK_ACTION_CONFIRMATION_MODAL_VISUAL_TEST.md`
2. Review the component implementation
3. Check browser console for errors
4. Verify TypeScript types are correct
